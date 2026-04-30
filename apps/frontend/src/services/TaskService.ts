import { apiClient } from '../core/api/apiClient';
import {
    TaskResponse,
    TaskCreateRequest,
    TaskStatusUpdateRequest,
    GroupedTasksResponse,
} from '../types/dto/task.dto';

export const TaskService = {
    async getTasks(): Promise<GroupedTasksResponse> {
        return apiClient.get('/tasks');
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

    async assignTask(id: string, initiatorId: string): Promise<any> {
        return apiClient.post(`/tasks/${id}/assign`, { initiatorId });
    },
};
