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
        return this.taskRepository.create(dto);
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
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new AppError('Task not found', 404, 'ERR_NOT_FOUND');
        }
        return this.taskRepository.advanceStatus(id, dto.status);
    }
}
