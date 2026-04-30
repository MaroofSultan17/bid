import Queue from 'bull';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const notificationQueue = new Queue('notifications', redisUrl);

export const JOB = {
    OUTBID_EMAIL: 'outbid_email',
    ASSIGNMENT_EMAIL: 'assignment_email',
} as const;
