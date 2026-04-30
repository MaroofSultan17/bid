import { notificationQueue, JOB } from '../queue';
import { sendEmail } from '../../mailer/mailer';
import pino from 'pino';

const logger = pino({ name: 'worker' });

notificationQueue.process(JOB.OUTBID_EMAIL, async (job) => {
    const { email, taskTitle, newLowestBid } = job.data;
    logger.info(`Processing outbid email for ${email}`);
    await sendEmail(
        email,
        `You have been outbid on ${taskTitle}`,
        `<p>A new lower bid of <b>${newLowestBid} hours</b> has been placed.</p>`
    );
});

notificationQueue.process(JOB.ASSIGNMENT_EMAIL, async (job) => {
    const { email, taskTitle, hoursCommitted, won } = job.data;
    const subject = won ? `You WON the task: ${taskTitle}` : `Task assignment update: ${taskTitle}`;
    const content = won 
        ? `<p>Congratulations! You have been assigned to <b>${taskTitle}</b> for ${hoursCommitted} hours.</p>`
        : `<p>The task <b>${taskTitle}</b> has been assigned to another bidder.</p>`;
    
    await sendEmail(email, subject, content);
});

logger.info('Notification worker started');
