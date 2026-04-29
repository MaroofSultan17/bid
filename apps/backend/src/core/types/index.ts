export enum FlashMessageType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message?: string;
    flash?: {
        type: FlashMessageType;
        text: string;
    };
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        [key: string]: any;
    };
    error?: {
        code: string;
        details?: any;
    };
}

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export enum TaskStatus {
    DRAFT = 'draft',
    OPEN = 'open',
    BIDDING_CLOSED = 'bidding_closed',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    REVIEW = 'review',
    DONE = 'done',
}

export enum BidStatus {
    ACTIVE = 'active',
    WON = 'won',
    OUTBID = 'outbid',
    INVALID = 'invalid',
}

export type PaginationParams = {
    page: number;
    limit: number;
};
