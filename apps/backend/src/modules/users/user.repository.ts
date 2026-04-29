import { Knex } from 'knex';
import { UserRow } from './user.types';

export class UserRepository {
    constructor(private db: Knex) {}

    async findAll(page: number, limit: number): Promise<UserRow[]> {
        const offset = (page - 1) * limit;
        const records = await this.db.raw(
            'SELECT id, name, email, hourly_rate AS "hourlyRate", current_workload_hours AS "currentWorkloadHours", max_capacity_hours AS "maxCapacityHours" FROM users ORDER BY created_at ASC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return records.rows;
    }

    async findById(id: string): Promise<UserRow | null> {
        const records = await this.db.raw(
            'SELECT id, name, email, hourly_rate AS "hourlyRate", current_workload_hours AS "currentWorkloadHours", max_capacity_hours AS "maxCapacityHours" FROM users WHERE id = ?',
            [id]
        );
        return records.rows[0] || null;
    }

    async updateWorkload(id: string, delta: number, trx?: Knex.Transaction): Promise<void> {
        const client = trx || this.db;
        await client.raw(
            'UPDATE users SET current_workload_hours = current_workload_hours + ?, updated_at = NOW() WHERE id = ?',
            [delta, id]
        );
    }

    async lockForUpdate(id: string, trx: Knex.Transaction): Promise<UserRow | null> {
        const records = await trx.raw(
            'SELECT id, name, email, hourly_rate AS "hourlyRate", current_workload_hours AS "currentWorkloadHours", max_capacity_hours AS "maxCapacityHours" FROM users WHERE id = ? FOR UPDATE',
            [id]
        );
        return records.rows[0] || null;
    }
}
