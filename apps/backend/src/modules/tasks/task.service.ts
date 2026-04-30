import { TaskRepository } from './task.repository';
import {
    TaskCreateRequest,
    TaskStatusUpdateRequest,
    TaskRow,
    TaskWithBidStats,
} from './task.types';
import { AppError } from '../../core/types';

export class TaskService {
    constructor(private taskRepository: TaskRepository) {}

    async createTask(dto: TaskCreateRequest): Promise<TaskRow> {
        return this.taskRepository.db.transaction(async (trx) => {
            await trx.raw(`SELECT set_config('app.current_user_id', ?, true)`, [dto.created_by]);
            return this.taskRepository.create(dto, trx);
        });
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
        return this.taskRepository.db.transaction(async (trx) => {
            await trx.raw(`SELECT set_config('app.current_user_id', ?, true)`, [dto.updated_by]);

            const task = await this.taskRepository.findById(id);
            if (!task) {
                throw new AppError('The requested task does not exist.', 404, 'ERR_NOT_FOUND');
            }

            if (dto.status === 'bidding_closed' && task.createdBy !== dto.updated_by) {
                throw new AppError(
                    'Access denied: Only the task creator can close bidding.',
                    403,
                    'ERR_UNAUTHORIZED'
                );
            }

            if (dto.status === 'done' && task.createdBy !== dto.updated_by) {
                throw new AppError(
                    'Access denied: Final acceptance must be performed by the task creator.',
                    403,
                    'ERR_UNAUTHORIZED'
                );
            }

            if (
                ['in_progress', 'review'].includes(dto.status) &&
                task.assignedTo !== dto.updated_by
            ) {
                throw new AppError(
                    'Access denied: Only the assigned user can update the progress or submit for review.',
                    403,
                    'ERR_UNAUTHORIZED'
                );
            }

            return this.taskRepository.advanceStatus(id, dto.status, trx);
        });
    }
}
