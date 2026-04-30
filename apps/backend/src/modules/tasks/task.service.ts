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
            // Requirement 2.1: Audit log user attribution (Using set_config for safety)
            await trx.raw(`SELECT set_config('app.current_user_id', ?, true)`, [dto.updated_by]);

            const task = await this.taskRepository.findById(id);
            if (!task) {
                throw new AppError('Task not found', 404, 'ERR_NOT_FOUND');
            }

            // Requirement: Task creator controls bidding closure
            if (dto.status === 'bidding_closed' && task.createdBy !== dto.updated_by) {
                throw new AppError(
                    'Only the task creator can close bidding',
                    403,
                    'ERR_UNAUTHORIZED'
                );
            }

            // Requirement: Only assigned user can start task
            if (
                ['in_progress', 'review', 'done'].includes(dto.status) &&
                task.assignedTo !== dto.updated_by
            ) {
                throw new AppError(
                    'Only the assigned user can update this task state',
                    403,
                    'ERR_UNAUTHORIZED'
                );
            }

            return this.taskRepository.advanceStatus(id, dto.status, trx);
        });
    }
}
