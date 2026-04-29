import axios from 'axios';
import pino from 'pino';

const logger = pino({ name: 'race-condition-test' });
const API_BASE = 'http://localhost:3001/api';

async function runTest() {
    logger.info('Starting race condition test...');

    // 1. Create a user with small capacity
    const userEmail = `race-user-${Date.now()}@test.com`;
    await axios.post(`${API_BASE}/users`, {
        name: 'Race User',
        email: userEmail,
        hourly_rate: 100,
        max_capacity_hours: 10,
    });

    const users = await axios.get(`${API_BASE}/users`);
    const user = users.data.data.find((u: any) => u.email === userEmail);
    logger.info({ userId: user.id }, 'Created user with 10h capacity');

    // 2. Create two tasks and close bidding
    const taskTitles = ['Task A (8h)', 'Task B (8h)'];
    const taskIds: string[] = [];

    for (const title of taskTitles) {
        const res = await axios.post(`${API_BASE}/tasks`, {
            title,
            complexity: 1,
            created_by: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Alice
        });
        const taskId = res.data.data.id;
        taskIds.push(taskId);

        // Place bid of 8h for our user
        await axios.post(
            `${API_BASE}/tasks/${taskId}/bids`,
            {
                hours_offered: 8,
            },
            {
                headers: { 'X-User-Id': user.id },
            }
        );

        // Close bidding
        await axios.patch(`${API_BASE}/tasks/${taskId}/status`, {
            status: 'bidding_closed',
        });

        logger.info({ taskId }, `Setup ${title}`);
    }

    // 3. Fire simultaneous assign calls
    logger.info('Firing simultaneous assign calls...');

    const results = await Promise.allSettled([
        axios.post(`${API_BASE}/tasks/${taskIds[0]}/assign`),
        axios.post(`${API_BASE}/tasks/${taskIds[1]}/assign`),
    ]);

    const successes = results.filter((r) => r.status === 'fulfilled');
    const failures = results.filter((r) => r.status === 'rejected');

    logger.info(
        {
            successCount: successes.length,
            failureCount: failures.length,
        },
        'Results received'
    );

    if (successes.length === 1 && failures.length === 1) {
        logger.info('SUCCESS: Only one task was assigned. Race condition handled correctly.');
    } else {
        logger.error(
            'FAILURE: Race condition handling failed. Both tasks assigned or both failed.'
        );
        process.exit(1);
    }
}

runTest().catch((err) => {
    logger.error(err);
    process.exit(1);
});
