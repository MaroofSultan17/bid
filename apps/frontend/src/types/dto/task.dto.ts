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

export interface TaskBoardSummary {
    id: string;
    title: string;
    complexity: number;
    deadline: string | null;
    bidCount: number;
    lowestBid: number | null;
}

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
    createdBy: string;
}

export interface TaskStatusUpdateRequest {
    status: TaskStatus;
    updatedBy: string;
}

export interface GroupedTasksResponse {
    draft: { count: number; tasks: TaskBoardSummary[] };
    open: { count: number; tasks: TaskBoardSummary[] };
    bidding_closed: { count: number; tasks: TaskBoardSummary[] };
    assigned: { count: number; tasks: TaskBoardSummary[] };
    in_progress: { count: number; tasks: TaskBoardSummary[] };
    review: { count: number; tasks: TaskBoardSummary[] };
    done: { count: number; tasks: TaskBoardSummary[] };
    meta: {
        totalTasks: number;
    };
}
