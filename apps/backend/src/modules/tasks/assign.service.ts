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

    async assign(taskId: string): Promise<AssignmentResult> {
        const result = await this.db.transaction(async (trx) => {
            const task = await this.taskRepository.lockForAssign(taskId, trx);
            if (!task) {
                throw new AppError(
                    'Task not found or not in bidding_closed status',
                    409,
                    'ERR_NOT_ASSIGNABLE'
                );
            }

            const bids = await this.bidRepository.findActiveBidsForAssign(taskId, trx);
            if (bids.length === 0) {
                throw new AppError('No bids to evaluate', 422, 'ERR_NO_BIDS');
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
                'No valid bidder with sufficient capacity',
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
