import { TaskRepository } from './task.repository';
import {
    TaskCreateRequest,
    TaskStatusUpdateRequest,
    TaskRow,
    TaskWithBidStats,
} from './task.types';
import { AppError } from '../../core/types';
import { sseManager } from '../../core/sse/sse.manager';

export class TaskService {
    constructor(private taskRepository: TaskRepository) {}

    async createTask(dto: TaskCreateRequest): Promise<TaskRow> {
        if (dto.deadline && new Date(dto.deadline).getTime() < Date.now()) {
            throw new AppError('Task deadline cannot be in the past.', 400, 'ERR_INVALID_DEADLINE');
        }

        const task = await this.taskRepository.db.transaction(async (trx) => {
            await trx.raw(`SELECT set_config('app.current_user_id', ?, true)`, [dto.created_by]);
            return this.taskRepository.create(dto, trx);
        });

        sseManager.publishGlobal('dashboard:update', { taskId: task.id });
        return task;
    }

    async getTask(id: string): Promise<TaskWithBidStats> {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new AppError('Task not found', 404, 'ERR_NOT_FOUND');
        }
        return task;
    }

    async getTasks(status?: string): Promise<TaskWithBidStats[]> {
        return this.taskRepository.findAll(status);
    }

    async advanceStatus(id: string, dto: TaskStatusUpdateRequest): Promise<TaskRow> {
        const task = await this.taskRepository.db.transaction(async (trx) => {
            await trx.raw(`SELECT set_config('app.current_user_id', ?, true)`, [dto.updated_by]);

            const existing = await this.taskRepository.findById(id);
            if (!existing) {
                throw new AppError('The requested task does not exist.', 404, 'ERR_NOT_FOUND');
            }

            if (dto.status === 'bidding_closed' && existing.createdBy !== dto.updated_by) {
                throw new AppError(
                    'Access denied: Only the task creator can close bidding.',
                    403,
                    'ERR_UNAUTHORIZED'
                );
            }

            if (dto.status === 'done' && existing.createdBy !== dto.updated_by) {
                throw new AppError(
                    'Access denied: Final acceptance must be performed by the task creator.',
                    403,
                    'ERR_UNAUTHORIZED'
                );
            }

            if (
                ['in_progress', 'review'].includes(dto.status) &&
                existing.assignedTo !== dto.updated_by
            ) {
                throw new AppError(
                    'Access denied: Only the assigned user can update the progress or submit for review.',
                    403,
                    'ERR_UNAUTHORIZED'
                );
            }

            return this.taskRepository.advanceStatus(id, dto.status, trx);
        });

        sseManager.publishGlobal('dashboard:update', { taskId: id });
        return task;
    }
}
