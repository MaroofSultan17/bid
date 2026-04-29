import { apiClient } from '../core/api/apiClient';
import { DashboardStatsResponseDTO } from '../types/dto/dashboard.dto';

export const DashboardService = {
    async getStats(): Promise<DashboardStatsResponseDTO> {
        return apiClient.get('/dashboard/stats');
    },
};
