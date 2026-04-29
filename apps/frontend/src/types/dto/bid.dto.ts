export interface BidGetResponseDTO {
    id: string;
    taskId: string;
    userId: string;
    hoursOffered: number;
    status: string;
    userName?: string;
    userEmail?: string;
}

export interface BidCreateRequestDTO {
    user_id: string;
    hours_offered: number;
}
