import { apiClient } from '../core/api/apiClient';
import { TaskResponse, TaskCreateRequest, TaskStatusUpdateRequest } from '../types/dto/task.dto';

export const TaskService = {
    async getTasks(status?: string): Promise<TaskResponse[]> {
        const params = status ? { status } : {};
        return apiClient.get('/tasks', { params });
    },

    async getTask(id: string): Promise<TaskResponse> {
        return apiClient.get(`/tasks/${id}`);
    },

    async createTask(data: TaskCreateRequest): Promise<TaskResponse> {
        return apiClient.post('/tasks', data);
    },

    async advanceStatus(id: string, data: TaskStatusUpdateRequest): Promise<TaskResponse> {
        return apiClient.patch(`/tasks/${id}/status`, data);
    },

    async assignTask(id: string): Promise<any> {
        return apiClient.post(`/tasks/${id}/assign`);
    },
};
