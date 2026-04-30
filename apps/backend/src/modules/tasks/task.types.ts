import { z } from 'zod';

export const TASK_STATUSES = [
    'draft',
    'open',
    'bidding_closed',
    'assigned',
    'in_progress',
    'review',
    'done',
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TaskCreateRequestSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    complexity: z.number().int().min(1).max(5),
    createdBy: z.string().uuid(),
    deadline: z.string().datetime().optional(),
});

export const TaskStatusUpdateRequestSchema = z.object({
    status: z.enum([
        'draft',
        'open',
        'bidding_closed',
        'assigned',
        'in_progress',
        'review',
        'done',
    ]),
    updatedBy: z.string().uuid(),
});

export const TaskAssignRequestSchema = z.object({
    initiatorId: z.string().uuid(),
});

export type TaskCreateRequest = z.infer<typeof TaskCreateRequestSchema>;
export type TaskStatusUpdateRequest = z.infer<typeof TaskStatusUpdateRequestSchema>;

export interface TaskRow {
    id: string;
    title: string;
    description: string | null;
    complexity: number;
    status: string;
    createdBy: string;
    assignedTo: string | null;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TaskWithBidStats extends TaskRow {
    bidCount: number;
    lowestBid: number | null;
}

export interface TaskBoardSummary {
    id: string;
    title: string;
    complexity: number;
    deadline: string | null;
    bidCount: number;
    lowestBid: number | null;
}

export interface AssignmentResult {
    taskId: string;
    assignedTo: string;
    assignedUserName: string;
    hoursCommitted: number;
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
