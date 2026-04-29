import { DashboardRepository } from './dashboard.repository';
import { DashboardStats } from './dashboard.types';

export class DashboardService {
    constructor(private dashboardRepository: DashboardRepository) {}

    async getStats(): Promise<DashboardStats> {
        return this.dashboardRepository.getStats();
    }
}
