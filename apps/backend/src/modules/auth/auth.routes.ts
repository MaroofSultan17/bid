import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../core/middleware/validate';
import { LoginRequestSchema } from './auth.types';

export const authRouter = Router();

authRouter.post('/login', validate(LoginRequestSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
