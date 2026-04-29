import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { requestLogger } from './core/middleware/requestLogger';
import { errorHandler } from './core/middleware/errorHandler';
import { requireAuth } from './core/middleware/auth.middleware';

import { authRouter } from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import taskRoutes from './modules/tasks/task.routes';
import bidRoutes from './modules/bids/bid.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.DEFAULT_HOST || 'http://localhost:3000',
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use('/api/auth', authRouter);

app.use('/api/users', requireAuth, userRoutes);
app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api/bids', requireAuth, bidRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);

app.use(errorHandler);

export default app;
