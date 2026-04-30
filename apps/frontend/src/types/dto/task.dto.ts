export type TaskStatus =
    | 'draft'
    | 'open'
    | 'bidding_closed'
    | 'assigned'
    | 'in_progress'
    | 'review'
    | 'done';

export const TASK_STATUS_ORDER: TaskStatus[] = [
    'draft',
    'open',
    'bidding_closed',
    'assigned',
    'in_progress',
    'review',
    'done',
];

export interface TaskResponse {
    id: string;
    title: string;
    description: string | null;
    complexity: number;
    status: TaskStatus;
    createdBy: string;
    assignedTo: string | null;
    deadline: string | null;
    bidCount: number;
    lowestBid: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface TaskCreateRequest {
    title: string;
    description?: string;
    complexity: number;
    deadline?: string;
    created_by: string;
}

export interface TaskStatusUpdateRequest {
    status: TaskStatus;
    updated_by: string;
}
