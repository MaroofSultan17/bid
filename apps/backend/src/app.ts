import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './core/middleware/requestLogger';
import { errorHandler } from './core/middleware/errorHandler';
import { sseManager } from './core/sse/sse.manager';
import { notificationQueue } from './core/queue/queue';
import { sendTestEmail } from './core/mailer/mailer';

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

app.get('/api/admin/test-email', async (req, res) => {
    try {
        const to = (req.query.to as string) || process.env.MAIL_USERNAME || 'maroofsultan17@gmail.com';
        await sendTestEmail(to);
        res.json({ success: true, message: `Test email sent to ${to}. Check your inbox!` });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/admin/queues', async (_req, res) => {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
        notificationQueue.getWaitingCount(),
        notificationQueue.getActiveCount(),
        notificationQueue.getCompletedCount(),
        notificationQueue.getFailedCount(),
        notificationQueue.getDelayedCount(),
    ]);
    res.json({
        queue: 'notifications',
        stats: { waiting, active, completed, failed, delayed },
    });
});

app.use(errorHandler);

export default app;
