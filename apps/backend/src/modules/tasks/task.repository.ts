import { Knex } from 'knex';
import { TaskCreateRequest, TaskRow, TaskWithBidStats } from './task.types';

export class TaskRepository {
    constructor(private db: Knex) {}

    async create(dto: TaskCreateRequest): Promise<TaskRow> {
        const [task] = await this.db('tasks')
            .insert({
                title: dto.title,
                description: dto.description,
                complexity: dto.complexity,
                created_by: dto.created_by,
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
      SELECT t.id, t.title, t.description, t.complexity, t.status,
             t.created_by as "createdBy", t.assigned_to as "assignedTo",
             t.deadline, t.created_at as "createdAt", t.updated_at as "updatedAt",
             COUNT(b.id)::int        AS "bidCount",
             MIN(b.hours_offered)::float    AS "lowestBid"
      FROM   tasks t
      LEFT   JOIN bids b ON b.task_id = t.id AND b.status = 'active'
      WHERE  t.id = ?
      GROUP  BY t.id
    `,
            [id]
        );
        return res.rows[0] || null;
    }

    async findAll(status?: string): Promise<TaskWithBidStats[]> {
        let query = `
      SELECT t.id, t.title, t.description, t.complexity, t.status,
             t.created_by as "createdBy", t.assigned_to as "assignedTo",
             t.deadline, t.created_at as "createdAt", t.updated_at as "updatedAt",
             COUNT(b.id)::int        AS "bidCount",
             MIN(b.hours_offered)::float    AS "lowestBid"
      FROM   tasks t
      LEFT   JOIN bids b ON b.task_id = t.id AND b.status = 'active'
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
