export type BidStatus = 'active' | 'won' | 'outbid' | 'invalid';

export interface BidResponse {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    userEmail: string;
    hoursOffered: number;
    status: BidStatus;
    placedAt: string;
    hourlyRate: number;
}

export interface BidCreateRequest {
    hours_offered: number;
    user_id: string;
}
