import fs from 'fs';
import path from 'path';
import db from './knex';
import pino from 'pino';

const logger = pino({ name: 'migrator' });

async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

    await db.schema.createTableIfNotExists('migration_log', (table) => {
        table.increments('id').primary();
        table.string('filename').notNullable().unique();
        table.timestamp('applied_at').defaultTo(db.fn.now());
    });

    for (const file of files) {
        const applied = await db('migration_log').where({ filename: file }).first();
        if (applied) {
            logger.info(`Skipping already applied migration: ${file}`);
            continue;
        }

        const migrationSql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

        const trx = await db.transaction();
        try {
            await trx.raw(migrationSql);
            await trx('migration_log').insert({ filename: file });
            await trx.commit();
            logger.info(`Applied migration: ${file}`);
        } catch (err) {
            await trx.rollback();
            logger.error({ err }, `Migration failed: ${file}`);
            process.exit(1);
        }
    }

    logger.info('All migrations completed successfully.');
    process.exit(0);
}

runMigrations().catch((err) => {
    logger.error({ err }, 'Unexpected error during migrations');
    process.exit(1);
});
