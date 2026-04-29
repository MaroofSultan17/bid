import { BidRepository } from './bid.repository';
import { BidCreateRequest, BidRow, BidWithUser } from './bid.types';
import { AppError } from '../../core/types';
import { sseManager } from '../../core/sse/sse.manager';
import db from '../../core/db/knex';

export class BidService {
    constructor(private bidRepository: BidRepository) {}

    async createBid(taskId: string, dto: BidCreateRequest): Promise<BidRow> {
        const bid = await this.bidRepository.create(taskId, dto);
        sseManager.broadcast('NEW_BID', bid);
        return bid;
    }

    async getBidsForTask(taskId: string): Promise<BidWithUser[]> {
        return this.bidRepository.findByTask(taskId);
    }
}
