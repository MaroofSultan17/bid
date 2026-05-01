import { Request, Response, NextFunction } from 'express';
import { AuditLogRepository } from './audit.repository';
import { ApiResponse } from '../../core/types';

export class AuditLogController {
    constructor(private repository: AuditLogRepository) {}

    getLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 15;

            const { logs, total } = await this.repository.findAll(page, limit);
            const totalPages = Math.ceil(total / limit);

            const response: ApiResponse<typeof logs> = {
                status: 'success',
                data: logs,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
            res.json(response);
        } catch (error) {
            next(error);
        }
    };
}
