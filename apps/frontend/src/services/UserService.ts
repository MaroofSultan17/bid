import { apiClient } from '../core/api/apiClient';
import { UserResponse } from '../types/dto/user.dto';

export const UserService = {
    async getUsers(): Promise<UserResponse[]> {
        return apiClient.get('/users');
    },

    async getWorkload(id: string): Promise<UserResponse> {
        return apiClient.get(`/users/${id}/workload`);
    },
};
