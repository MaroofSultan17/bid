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
        page: number;
        limit: number;
        total: number;
        totalPages: number;
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
