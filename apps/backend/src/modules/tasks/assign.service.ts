import { Knex } from 'knex';
import { TaskRepository } from './task.repository';
import { BidRepository } from '../bids/bid.repository';
import { UserRepository } from '../users/user.repository';
import { AssignmentResult } from './task.types';
import { AppError } from '../../core/types';
import { sseManager } from '../../core/sse/sse.manager';
import { notificationQueue, JOB } from '../../core/queue/queue';

export class AssignService {
    constructor(
        private db: Knex,
        private taskRepository: TaskRepository,
        private bidRepository: BidRepository,
        private userRepository: UserRepository
    ) {}

    async assign(taskId: string, initiatorId?: string): Promise<AssignmentResult> {
        const result = await this.db.transaction(async (trx) => {
            if (initiatorId) {
                await trx.raw(`SELECT set_config('app.current_user_id', ?, true)`, [initiatorId]);
            }
            const task = await this.taskRepository.lockForAssign(taskId, trx);
            if (!task) {
                throw new AppError(
                    'This task cannot be assigned. It may not exist or its bidding is not yet closed.',
                    409,
                    'ERR_NOT_ASSIGNABLE'
                );
            }

            if (task.deadline && new Date(task.deadline).getTime() < Date.now()) {
                throw new AppError(
                    'Cannot assign task. The task deadline has expired.',
                    409,
                    'ERR_DEADLINE_PASSED'
                );
            }

            const bids = await this.bidRepository.findActiveBidsForAssign(taskId, trx);
            if (bids.length === 0) {
                throw new AppError(
                    'Assignment failed: No bids found to evaluate for this task.',
                    422,
                    'ERR_NO_BIDS'
                );
            }

            for (const bid of bids) {
                const user = await this.userRepository.lockForUpdate(bid.userId, trx);
                if (!user) continue;

                const remaining = Number(user.maxCapacityHours) - Number(user.currentWorkloadHours);
                const offered = Number(bid.hoursOffered);

                if (offered > remaining) {
                    await this.bidRepository.updateStatus(bid.id, 'invalid', trx);
                    continue;
                }

                await this.userRepository.updateWorkload(user.id, offered, trx);
                await this.taskRepository.assignTask(taskId, user.id, trx);
                await this.bidRepository.updateStatus(bid.id, 'won', trx);
                await this.bidRepository.updateAllExcept(taskId, bid.id, 'outbid', trx);

                return {
                    taskId,
                    assignedTo: user.id,
                    assignedUserName: user.name,
                    hoursCommitted: offered,
                };
            }

            throw new AppError(
                'Assignment failed: None of the active bidders have sufficient remaining capacity.',
                422,
                'ERR_NO_VALID_BIDDER'
            );
        });

        sseManager.publish(taskId, 'task:assigned', {
            assignedTo: result.assignedTo,
            assignedUserName: result.assignedUserName,
            hoursCommitted: result.hoursCommitted,
        });
        sseManager.publishGlobal('dashboard:update', { taskId });
        sseManager.publishGlobal('queue:update', { taskId });

        const allBids = await this.bidRepository.findByTask(taskId);
        const loserBids = allBids.filter((b) => b.userId !== result.assignedTo);
        for (const loser of loserBids) {
            notificationQueue
                .add(
                    JOB.ASSIGNMENT_EMAIL,
                    {
                        email: loser.userEmail,
                        taskTitle: taskId,
                        hoursCommitted: result.hoursCommitted,
                        won: false,
                    },
                    { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
                )
                .catch(() => {});
        }

        const winnerBid = allBids.find((b) => b.userId === result.assignedTo);
        if (winnerBid) {
            notificationQueue
                .add(
                    JOB.ASSIGNMENT_EMAIL,
                    {
                        email: winnerBid.userEmail,
                        taskTitle: taskId,
                        hoursCommitted: result.hoursCommitted,
                        won: true,
                    },
                    { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
                )
                .catch(() => {});
        }

        return result;
    }
}
