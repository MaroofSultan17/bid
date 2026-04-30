import fs from 'fs';
import path from 'path';
import db from './knex';
import pino from 'pino';

const logger = pino({ name: 'seeder' });

async function runSeed() {
    const seedFile = path.join(__dirname, 'seeds/seed.sql');
    
    if (!fs.existsSync(seedFile)) {
        logger.error(`Seed file not found at: ${seedFile}`);
        process.exit(1);
    }

    const seedSql = fs.readFileSync(seedFile, 'utf-8');

    logger.info('Starting database seed...');

    const trx = await db.transaction();
    try {
        await trx.raw(seedSql);
        await trx.commit();
        logger.info('Database seeded successfully.');
        process.exit(0);
    } catch (err) {
        await trx.rollback();
        logger.error({ err }, 'Seed failed');
        process.exit(1);
    }
}

runSeed().catch((err) => {
    logger.error({ err }, 'Unexpected error during seeding');
    process.exit(1);
});
