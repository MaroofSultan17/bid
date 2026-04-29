import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse, FlashMessageType } from '../types';
import pino from 'pino';

const logger = pino({ name: 'error-handler' });

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        const response: ApiResponse = {
            status: 'error',
            message: err.message,
            error: { code: err.code || 'ERR_INTERNAL', details: err.details },
            flash: { type: FlashMessageType.ERROR, text: err.message },
        };
        return res.status(err.statusCode).json(response);
    }

    if (err.name === 'ZodError') {
        const response: ApiResponse = {
            status: 'error',
            message: 'Validation failed',
            error: { code: 'ERR_VALIDATION', details: err.errors },
            flash: { type: FlashMessageType.ERROR, text: 'Validation failed' },
        };
        return res.status(422).json(response);
    }

    if (err.code === '23505') {
        const response: ApiResponse = {
            status: 'error',
            message: 'Resource already exists',
            error: { code: 'ERR_CONFLICT' },
            flash: { type: FlashMessageType.ERROR, text: 'Resource already exists' },
        };
        return res.status(409).json(response);
    }

    if (err.code === 'P0001') {
        const msg = err.message || '';
        const prefixMatch = msg.match(/^(ERR_[A-Z_]+):/);
        const code = prefixMatch ? prefixMatch[1] : 'ERR_BAD_REQUEST';
        const cleanMsg = prefixMatch ? msg.replace(prefixMatch[0], '').trim() : msg;

        const response: ApiResponse = {
            status: 'error',
            message: cleanMsg,
            error: { code },
            flash: { type: FlashMessageType.ERROR, text: cleanMsg },
        };
        return res.status(400).json(response);
    }

    logger.error(err);

    const response: ApiResponse = {
        status: 'error',
        message: 'Internal server error',
        error: { code: 'ERR_INTERNAL' },
    };
    return res.status(500).json(response);
};
