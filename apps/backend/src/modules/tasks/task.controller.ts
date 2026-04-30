import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service';
import { AssignService } from './assign.service';
import { ApiResponse, FlashMessageType } from '../../core/types';

export class TaskController {
    constructor(
        private taskService: TaskService,
        private assignService: AssignService
    ) {}

    createTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const task = await this.taskService.createTask(req.body);
            const response: ApiResponse<typeof task> = {
                status: 'success',
                data: task,
                flash: { type: FlashMessageType.SUCCESS, text: 'Task created successfully' },
            };
            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    };

    getTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const task = await this.taskService.getTask(req.params.id);
            const response: ApiResponse<typeof task> = {
                status: 'success',
                data: task,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    getTasks = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const tasks = await this.taskService.getTasks();
            const response: ApiResponse<typeof tasks> = {
                status: 'success',
                data: tasks,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    advanceStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const task = await this.taskService.advanceStatus(req.params.id, req.body);
            const response: ApiResponse<typeof task> = {
                status: 'success',
                data: task,
                flash: { type: FlashMessageType.SUCCESS, text: 'Task status updated' },
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    assignTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const initiatorId = req.body.initiatorId;
            const assignment = await this.assignService.assign(req.params.id, initiatorId);
            const response: ApiResponse<typeof assignment> = {
                status: 'success',
                data: assignment,
                flash: { type: FlashMessageType.SUCCESS, text: 'Task assigned successfully' },
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };
}
