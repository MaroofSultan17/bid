import { apiClient } from '../core/api/apiClient';

export interface AuditLog {
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
    data: AuditLog[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const AuditLogService = {
    async getLogs(page: number = 1, limit: number = 15): Promise<PaginatedAuditLogs> {
        const response = await apiClient.get('/admin/audit-logs', { params: { page, limit } });
        return response as any;
    },
};
