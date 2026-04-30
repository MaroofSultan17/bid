import { notificationQueue, JOB } from '../queue';
import { sendOutbidEmail, sendAssignmentEmail } from '../../mailer/mailer';
import { sseManager } from '../../sse/sse.manager';
import pino from 'pino';

const logger = pino({ name: 'notification-worker' });

notificationQueue.process(async (job) => {
    const { data } = job;

    try {
        switch (job.name) {
            case JOB.OUTBID_EMAIL: {
                await sendOutbidEmail(data.email, data.taskTitle, data.newLowestBid);
                logger.info({ jobId: job.id }, 'Outbid email sent');
                break;
            }
            case JOB.ASSIGNMENT_EMAIL: {
                await sendAssignmentEmail(data.email, data.taskTitle, data.hoursCommitted, data.won);
                logger.info({ jobId: job.id }, 'Assignment email sent');
                break;
            }
            default:
                logger.warn({ jobName: job.name }, 'Unknown job type');
        }
    } finally {
        sseManager.publishGlobal('queue:update', {});
    }
});

notificationQueue.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'Job failed');
    sseManager.publishGlobal('queue:update', {});
});

logger.info('Notification worker started');
