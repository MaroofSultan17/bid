import 'dotenv/config';
import app from './app';
import pino from 'pino';
import knex from './core/db/knex';
import './core/queue/workers/notification.worker';

const logger = pino({ name: 'server' });
const PORT = process.env.PORT || 3001;

async function bootstrap() {
    try {
        await knex.raw('SELECT 1');
        logger.info('Database connected successfully');

        app.listen(PORT, () => {
            logger.info(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        logger.error(error, 'Failed to start server');
        process.exit(1);
    }
}

bootstrap();
