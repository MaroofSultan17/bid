import axios from 'axios';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import db from '../core/db/knex';

const logger = pino({
    name: 'race-condition-test',
    transport: {
        target: 'pino-pretty',
        options: { colorize: true },
    },
});

const API_BASE = 'http://localhost:3001/api';

async function runTest() {
    logger.info('Starting race condition test...');

    const creatorId = uuidv4();
    const bidderId = uuidv4();
    const taskIds: string[] = [];

    try {
        // 1. Setup: Create temporary users directly in DB
        await db('users').insert([
            {
                id: creatorId,
                name: 'Test Creator',
                email: `creator-${Date.now()}@test.com`,
                hourly_rate: 100,
                max_capacity_hours: 100,
            },
            {
                id: bidderId,
                name: 'Test Bidder',
                email: `bidder-${Date.now()}@test.com`,
                hourly_rate: 50,
                max_capacity_hours: 10,
            },
        ]);
        logger.info('Created temporary test users');

        // 2. Setup: Create tasks and bids
        for (const title of ['Race Task 1 (8h)', 'Race Task 2 (8h)']) {
            const taskRes = await axios.post(`${API_BASE}/tasks`, {
                title,
                complexity: 1,
                created_by: creatorId,
            });
            const taskId = taskRes.data.data.id;
            taskIds.push(taskId);

            // Open task
            await axios.patch(`${API_BASE}/tasks/${taskId}/status`, {
                status: 'open',
                updated_by: creatorId,
            });

            // Place bid
            await axios.post(`${API_BASE}/tasks/${taskId}/bids`, {
                user_id: bidderId,
                hours_offered: 8,
            });

            // Close bidding
            await axios.patch(`${API_BASE}/tasks/${taskId}/status`, {
                status: 'bidding_closed',
                updated_by: creatorId,
            });

            logger.info({ taskId }, `Prepared ${title}`);
        }

        // 3. Execution: Fire simultaneous assignment calls
        logger.info('Firing simultaneous assignment calls...');
        const results = await Promise.allSettled([
            axios.post(`${API_BASE}/tasks/${taskIds[0]}/assign`, { initiator_id: creatorId }),
            axios.post(`${API_BASE}/tasks/${taskIds[1]}/assign`, { initiator_id: creatorId }),
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

        // 4. Verification
        if (successes.length === 1 && failures.length === 1) {
            logger.info('SUCCESS: Race condition handled correctly. Only one task assigned.');
        } else if (successes.length === 2) {
            logger.error('FAILURE: RACE CONDITION DETECTED! Both tasks were assigned.');
        } else {
            logger.error('FAILURE: Unexpected result. Check server logs.');
        }
    } catch (err: any) {
        logger.error(
            {
                message: err.message,
                response: err.response?.data,
            },
            'Test crashed'
        );
    } finally {
        // 5. Cleanup
        logger.info('Cleaning up test data...');
        try {
            await db('bids').whereIn('task_id', taskIds).delete();
            await db('tasks').whereIn('id', taskIds).delete();
            await db('users').whereIn('id', [creatorId, bidderId]).delete();
            logger.info('Cleanup complete.');
        } catch (cleanupErr) {
            logger.error('Cleanup failed.');
        }
        await db.destroy();
    }
}

runTest();
