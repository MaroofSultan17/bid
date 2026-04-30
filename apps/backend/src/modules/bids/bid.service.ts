import { BidRepository } from './bid.repository';
import { BidCreateRequest, BidRow, BidWithUser } from './bid.types';
import { sseManager } from '../../core/sse/sse.manager';
import { AppError } from '../../core/types';
import { notificationQueue, JOB } from '../../core/queue/queue';

export class BidService {
    constructor(private bidRepository: BidRepository) {}

    async createBid(taskId: string, dto: BidCreateRequest): Promise<BidRow> {
        const bid = await this.bidRepository.db.transaction(async (trx) => {
            const task = await trx('tasks')
                .where({ id: taskId })
                .select('status', 'deadline')
                .first();

            if (!task) {
                throw new AppError('The specified task was not found.', 404, 'ERR_NOT_FOUND');
            }

            if (task.status !== 'open') {
                throw new AppError('Bidding is only allowed on open tasks.', 409, 'ERR_NOT_OPEN');
            }

            if (task.deadline && new Date(task.deadline).getTime() < Date.now()) {
                throw new AppError(
                    'Cannot place bid. The task deadline has expired.',
                    409,
                    'ERR_DEADLINE_PASSED'
                );
            }

            await trx.raw(`SELECT set_config('app.current_user_id', ?, true)`, [dto.user_id]);

            const user = await this.bidRepository
                .db('users')
                .where({ id: dto.user_id })
                .select('current_workload_hours', 'max_capacity_hours')
                .first();

            if (!user) {
                throw new AppError(
                    'The specified user profile was not found.',
                    404,
                    'ERR_USER_NOT_FOUND'
                );
            }

            const remaining = Number(user.max_capacity_hours) - Number(user.current_workload_hours);
            if (dto.hours_offered > remaining) {
                throw new AppError(
                    `Bid exceeds your remaining available capacity (${remaining}h).`,
                    422,
                    'ERR_OVER_CAPACITY'
                );
            }

            return this.bidRepository.create(taskId, dto, trx);
        });

        const bidsWithUser = await this.bidRepository.findByTask(taskId);
        const newBidWithUser = bidsWithUser.find((b) => b.id === bid.id);

        sseManager.publish(taskId, 'bid:new', { bid: newBidWithUser || bid });

        const outbidUsers = bidsWithUser.filter(
            (b) => b.userId !== dto.user_id && b.hoursOffered > dto.hours_offered
        );
        for (const outbid of outbidUsers) {
            notificationQueue
                .add(
                    JOB.OUTBID_EMAIL,
                    {
                        email: outbid.userEmail,
                        taskTitle: taskId,
                        newLowestBid: dto.hours_offered,
                    },
                    { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
                )
                .catch(() => {});
        }

        sseManager.publishGlobal('queue:update', { taskId });

        return bid;
    }

    async getBidsForTask(taskId: string): Promise<BidWithUser[]> {
        return this.bidRepository.findByTask(taskId);
    }
}
