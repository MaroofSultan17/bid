import { Knex } from 'knex';
import { TaskCreateRequest, TaskRow, TaskWithBidStats } from './task.types';

export class TaskRepository {
    constructor(public db: Knex) {}

    async create(dto: TaskCreateRequest, trx?: Knex.Transaction): Promise<TaskRow> {
        const client = trx || this.db;
        const [task] = await client('tasks')
            .insert({
                title: dto.title,
                description: dto.description,
                complexity: dto.complexity,
                created_by: dto.createdBy,
                deadline: dto.deadline,
            })
            .returning([
                'id',
                'title',
                'description',
                'complexity',
                'status',
                'created_by as createdBy',
                'assigned_to as assignedTo',
                'deadline',
                'created_at as createdAt',
                'updated_at as updatedAt',
            ]);
        return task;
    }

    async findById(id: string): Promise<TaskWithBidStats | null> {
        const res = await this.db.raw(
            `
      WITH task_summary AS (
        SELECT t.*,
               COUNT(b.id)::int AS "bidCount"
        FROM tasks t
        LEFT JOIN bids b ON b.task_id = t.id AND b.status != 'invalid'
        WHERE t.id = ?
        GROUP BY t.id
      ),
      lowest_bid AS (
        SELECT task_id, hours_offered, user_id
        FROM bids
        WHERE task_id = ? AND status != 'invalid'
        ORDER BY hours_offered ASC
        LIMIT 1
      )
      SELECT ts.id, ts.title, ts.description, ts.complexity, ts.status,
             ts.created_by as "createdBy", ts.assigned_to as "assignedTo",
             ts.deadline, ts.created_at as "createdAt", ts.updated_at as "updatedAt",
             ts."bidCount",
             lb.hours_offered::float AS "lowestBid",
             u.hourly_rate::float AS "lowestBidderRate"
      FROM task_summary ts
      LEFT JOIN lowest_bid lb ON lb.task_id = ts.id
      LEFT JOIN users u ON u.id = lb.user_id
    `,
            [id, id]
        );
        return res.rows[0] || null;
    }

    async findAll(status?: string): Promise<TaskWithBidStats[]> {
        let query = `
      SELECT t.id, t.title, t.description, t.complexity, t.status,
             t.created_by as "createdBy", t.assigned_to as "assignedTo",
             t.deadline, t.created_at as "createdAt", t.updated_at as "updatedAt",
             COUNT(b.id)::int        AS "bidCount",
             MIN(CASE WHEN b.status IN ('active', 'won') THEN b.hours_offered END)::float AS "lowestBid"
      FROM   tasks t
      LEFT   JOIN bids b ON b.task_id = t.id AND b.status != 'invalid'
    `;
        const params: any[] = [];
        if (status) {
            query += ` WHERE t.status = ? `;
            params.push(status);
        }
        query += ` GROUP BY t.id ORDER BY t.created_at DESC`;

        const res = await this.db.raw(query, params);
        return res.rows;
    }

    async advanceStatus(id: string, newStatus: string, trx?: Knex.Transaction): Promise<TaskRow> {
        const client = trx || this.db;
        const res = await client.raw(
            `
      UPDATE tasks 
      SET status = ?, updated_at = NOW() 
      WHERE id = ? 
      RETURNING id, title, description, complexity, status, created_by as "createdBy", assigned_to as "assignedTo", deadline, created_at as "createdAt", updated_at as "updatedAt"
    `,
            [newStatus, id]
        );
        return res.rows[0];
    }

    async lockForAssign(id: string, trx: Knex.Transaction): Promise<TaskRow | null> {
        const res = await trx.raw(
            `
      SELECT id, title, description, complexity, status, 
             created_by as "createdBy", assigned_to as "assignedTo", 
             deadline, created_at as "createdAt", updated_at as "updatedAt"
      FROM tasks 
      WHERE id = ? AND status = 'bidding_closed' 
      FOR UPDATE
    `,
            [id]
        );
        return res.rows[0] || null;
    }

    async assignTask(taskId: string, userId: string, trx: Knex.Transaction): Promise<void> {
        await trx.raw(
            `
      UPDATE tasks 
      SET assigned_to = ?, status = 'assigned', updated_at = NOW() 
      WHERE id = ?
    `,
            [userId, taskId]
        );
    }
}
