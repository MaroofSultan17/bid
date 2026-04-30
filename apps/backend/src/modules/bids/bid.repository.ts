import { Knex } from 'knex';
import { BidCreateRequest, BidRow, BidWithUser } from './bid.types';

export class BidRepository {
    constructor(public db: Knex) {}

    async create(taskId: string, dto: BidCreateRequest, trx?: Knex.Transaction): Promise<BidRow> {
        const client = trx || this.db;
        const [bid] = await client('bids')
            .insert({
                task_id: taskId,
                user_id: dto.user_id,
                hours_offered: dto.hours_offered,
            })
            .returning([
                'id',
                'task_id as taskId',
                'user_id as userId',
                'hours_offered as hoursOffered',
                'status',
                'placed_at as placedAt',
            ]);
        return bid;
    }

    async findByTask(taskId: string): Promise<BidWithUser[]> {
        const res = await this.db.raw(
            `
      SELECT b.id, b.task_id as "taskId", b.user_id as "userId", b.hours_offered as "hoursOffered", b.status, b.placed_at as "placedAt",
             u.name AS "userName", u.email AS "userEmail"
      FROM   bids b
      JOIN   users u ON u.id = b.user_id
      WHERE  b.task_id = ?
      ORDER  BY b.hours_offered ASC
    `,
            [taskId]
        );
        return res.rows;
    }

    async findActiveBidsForAssign(taskId: string, trx: Knex.Transaction): Promise<BidWithUser[]> {
        const res = await trx.raw(
            `
      SELECT b.id, b.task_id as "taskId", b.user_id as "userId", b.hours_offered as "hoursOffered", b.status, b.placed_at as "placedAt",
             u.name AS "userName", u.email AS "userEmail",
             u.current_workload_hours as "currentWorkloadHours", u.max_capacity_hours as "maxCapacityHours"
      FROM   bids b
      JOIN   users u ON u.id = b.user_id
      WHERE  b.task_id = ? AND b.status = 'active'
      ORDER  BY b.hours_offered ASC
      FOR    UPDATE OF b, u
    `,
            [taskId]
        );
        return res.rows;
    }

    async updateStatus(bidId: string, status: string, trx?: Knex.Transaction): Promise<void> {
        const client = trx || this.db;
        await client.raw('UPDATE bids SET status = ? WHERE id = ?', [status, bidId]);
    }

    async updateAllExcept(
        taskId: string,
        winningBidId: string,
        status: string,
        trx: Knex.Transaction
    ): Promise<void> {
        await trx.raw(
            `
      UPDATE bids SET status = ? 
      WHERE task_id = ? AND id != ? AND status = 'active'
    `,
            [status, taskId, winningBidId]
        );
    }
}
