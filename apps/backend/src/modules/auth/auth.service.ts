import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { knex } from '../../core/db/knex';
import { AppError } from '../../core/types';
import { LoginRequestDTO } from './auth.types';

export class AuthService {
    async login(payload: LoginRequestDTO) {
        const user = await knex('users').where({ email: payload.email }).first();

        if (!user) {
            throw new AppError('Invalid credentials', 400);
        }

        if (user.password_hash) {
            const isValid = await bcrypt.compare(payload.password, user.password_hash);
            if (!isValid) {
                throw new AppError('Invalid credentials', 400);
            }
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
        };

        const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret', {
            expiresIn: process.env.JWT_EXPIRATION || '15m',
        });

        const refreshToken = jwt.sign(
            tokenPayload,
            process.env.JWT_REFRESH_SECRET || 'refresh_secret',
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
            }
        );

        return { user, accessToken, refreshToken };
    }
}
export const authService = new AuthService();
