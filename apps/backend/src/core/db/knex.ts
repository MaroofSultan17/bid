import knex from 'knex';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
}

const db = knex({
    client: 'pg',
    connection: dbUrl,
    pool: { min: 2, max: 10 },
    postProcessResponse: (result) => {
        if (Array.isArray(result)) {
            return result.map((row) => {
                if (typeof row === 'object' && row !== null) {
                    const camelCaseRow: any = {};
                    for (const key in row) {
                        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                        camelCaseRow[camelKey] = row[key];
                    }
                    return camelCaseRow;
                }
                return row;
            });
        }
        return result;
    },
});

export default db;
