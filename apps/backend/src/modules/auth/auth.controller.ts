import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authService } from './auth.service';
import { LoginRequestDTO } from './auth.types';
import { ApiResponse, AppError } from '../../core/types';

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = req.body as LoginRequestDTO;
            const { user, accessToken, refreshToken } = await authService.login(payload);

            const response: ApiResponse = {
                status: 'success',
                data: {
                    user,
                    token: accessToken,
                    refresh_token: refreshToken,
                    refresh_token_expiration: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
                },
            };

            res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.body.refresh_token;
            if (!refreshToken) {
                return next(new AppError('No refresh token provided', 400));
            }

            const payload = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET || 'devrefreshsecret'
            ) as any;

            const tokenPayload = { id: payload.id, email: payload.email };
            const newAccessToken = jwt.sign(
                tokenPayload,
                process.env.JWT_SECRET || 'devsecretjwt',
                { expiresIn: '15m' }
            );
            const newRefreshToken = jwt.sign(
                tokenPayload,
                process.env.JWT_REFRESH_SECRET || 'devrefreshsecret',
                { expiresIn: '7d' }
            );

            const response: ApiResponse = {
                status: 'success',
                data: {
                    token: newAccessToken,
                    refresh_token: newRefreshToken,
                    refresh_token_expiration: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
                },
            };

            res.json(response);
        } catch (e) {
            return next(new AppError('Invalid refresh token', 401));
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const response: ApiResponse = { status: 'success', data: null };
            res.json(response);
        } catch (e) {
            next(e);
        }
    }
}

export const authController = new AuthController();
