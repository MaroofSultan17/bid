import { apiClient } from '../core/api/apiClient';
import { BidResponse, BidCreateRequest } from '../types/dto/bid.dto';

export const BidService = {
    async getBids(taskId: string): Promise<BidResponse[]> {
        return apiClient.get(`/tasks/${taskId}/bids`);
    },

    async placeBid(taskId: string, data: BidCreateRequest): Promise<BidResponse> {
        return apiClient.post(`/tasks/${taskId}/bids`, data);
    },
};
