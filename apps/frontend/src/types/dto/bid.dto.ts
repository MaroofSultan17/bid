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
}

export interface BidCreateRequest {
    hours_offered: number;
}
