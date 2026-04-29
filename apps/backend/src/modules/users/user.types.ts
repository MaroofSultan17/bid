import { z } from 'zod';

export const UserIndexRequestSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export const UserShowRequestSchema = z.object({
    id: z.string().uuid(),
});

export type UserIndexRequest = z.infer<typeof UserIndexRequestSchema>;
export type UserShowRequest = z.infer<typeof UserShowRequestSchema>;

export interface UserRow {
    id: string;
    name: string;
    email: string;
    hourlyRate: number;
    currentWorkloadHours: number;
    maxCapacityHours: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserWorkloadResponse {
    id: string;
    name: string;
    email: string;
    hourlyRate: number;
    currentWorkloadHours: number;
    maxCapacityHours: number;
    remainingCapacityHours: number;
}
