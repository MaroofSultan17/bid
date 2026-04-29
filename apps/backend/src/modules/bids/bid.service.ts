import { BidRepository } from './bid.repository';
import { BidCreateRequest, BidRow, BidWithUser } from './bid.types';
import { sseManager } from '../../core/sse/sse.manager';
import { notificationQueue, JOB } from '../../core/queue/queue';

export class BidService {
    constructor(private bidRepository: BidRepository) {}

    async createBid(taskId: string, dto: BidCreateRequest): Promise<BidRow> {
        const bid = await this.bidRepository.create(taskId, dto);

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

        return bid;
    }

    async getBidsForTask(taskId: string): Promise<BidWithUser[]> {
        return this.bidRepository.findByTask(taskId);
    }
}
