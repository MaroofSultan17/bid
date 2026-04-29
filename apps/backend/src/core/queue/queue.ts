import Queue from 'bull';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const notificationQueue = new Queue('notifications', redisUrl);
