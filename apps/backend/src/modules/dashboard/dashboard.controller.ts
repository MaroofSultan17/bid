import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { ApiResponse } from '../../core/types';

export class DashboardController {
    constructor(private dashboardService: DashboardService) {}

    getStats = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await this.dashboardService.getStats();
            const response: ApiResponse<typeof stats> = {
                status: 'success',
                data: stats,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };
}
