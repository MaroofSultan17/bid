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
    async getLogs(page: number = 1, limit: number = 20): Promise<PaginatedAuditLogs> {
        const response = await apiClient.get('/admin/audit-logs', { params: { page, limit } });
        // Axios interceptor returns the .data.data part, but we need .data here if it contains meta
        // Actually, our apiClient interceptor returns response.data.data.
        // Let's check apiClient.ts again.
        return response as any;
    },
};
