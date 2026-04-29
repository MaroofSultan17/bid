import { z } from 'zod';

export const TaskCreateRequestSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    complexity: z.number().int().min(1).max(5),
    created_by: z.string().uuid(),
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
    updated_by: z.string().uuid(),
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

export interface AssignmentResult {
    taskId: string;
    assignedTo: string;
    assignedUserName: string;
    hoursCommitted: number;
}
