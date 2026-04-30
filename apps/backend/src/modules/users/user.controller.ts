import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../core/types';

export class UserController {
    constructor(private userService: UserService) {}

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getUsers(req.query as any);

            const response: ApiResponse<typeof users> = {
                status: 'success',
                data: users,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    getWorkload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const workload = await this.userService.getWorkload(req.params.id);
            const response: ApiResponse<typeof workload> = {
                status: 'success',
                data: workload,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };
}
