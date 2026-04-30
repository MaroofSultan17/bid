import Queue from 'bull';

export const JOB = {
    OUTBID_EMAIL: 'OUTBID_EMAIL',
    ASSIGNMENT_EMAIL: 'ASSIGNMENT_EMAIL',
};

export const notificationQueue = new Queue(
    'notifications',
    process.env.REDIS_URL || 'redis://localhost:6379'
);
