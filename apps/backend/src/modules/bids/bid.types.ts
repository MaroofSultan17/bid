import { z } from 'zod';

export const BidCreateRequestSchema = z.object({
    user_id: z.string().uuid(),
    hours_offered: z.number().positive(),
});

export type BidCreateRequest = z.infer<typeof BidCreateRequestSchema>;

export interface BidRow {
    id: string;
    taskId: string;
    userId: string;
    hoursOffered: number;
    status: string;
    placedAt: string;
}

export interface BidWithUser extends BidRow {
    userName: string;
    userEmail: string;
}
