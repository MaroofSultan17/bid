import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './core/middleware/requestLogger';
import { errorHandler } from './core/middleware/errorHandler';
import { sseManager } from './core/sse/sse.manager';

import userRoutes from './modules/users/user.routes';
import taskRoutes from './modules/tasks/task.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    })
);
app.use(express.json());
app.use(requestLogger);

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/events', (req, res) => {
    sseManager.subscribeGlobal(res);
});

app.use(errorHandler);

export default app;
