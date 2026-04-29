import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../types';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('Authentication required', 401, 'auth_required'));
    }

    try {
        const secret = process.env.JWT_SECRET || 'devsecretjwt';
        const decoded = jwt.verify(token, secret);

        (req as any).user = decoded;

        next();
    } catch (_error) {
        return next(new AppError('Invalid or expired token', 401, 'invalid_token'));
    }
};
