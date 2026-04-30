import { Knex } from 'knex';

export interface AuditLogResponse {
    id: string;
    entityType: string;
    entityId: string;
    fieldChanged: string;
    oldValue: any;
    newValue: any;
    changedAt: string;
    userName: string | null;
    userEmail: string | null;
}

export interface PaginatedAuditLogs {
    logs: AuditLogResponse[];
    total: number;
}

export class AuditLogRepository {
    constructor(private db: Knex) {}

    async findAll(page: number = 1, limit: number = 50): Promise<PaginatedAuditLogs> {
        const offset = (page - 1) * limit;

        const countRes = await this.db.raw('SELECT COUNT(*)::int as count FROM audit_logs');
        const total = countRes.rows[0].count;

        const res = await this.db.raw(
            `
            SELECT 
                al.id, 
                al.entity_type as "entityType", 
                al.entity_id as "entityId", 
                al.field_changed as "fieldChanged", 
                al.old_value as "oldValue", 
                al.new_value as "newValue", 
                al.changed_at as "changedAt",
                u.name as "userName",
                u.email as "userEmail"
            FROM audit_logs al
            LEFT JOIN users u ON u.id = al.changed_by
            ORDER BY al.changed_at DESC
            LIMIT ? OFFSET ?
        `,
            [limit, offset]
        );

        return {
            logs: res.rows,
            total,
        };
    }
}
