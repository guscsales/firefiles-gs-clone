import { resolve } from 'node:path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const nodeEnv = process.env.NODE_ENV ?? 'development';

if (nodeEnv === 'development') {
  config({ path: resolve(process.cwd(), '.env.local'), quiet: true });
} else if (nodeEnv === 'production') {
  config({ path: resolve(process.cwd(), '.env.prod'), quiet: true });
}

(async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const migrationClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(migrationClient);

  await migrate(db, {
    migrationsFolder: resolve(__dirname, 'migrations')
  });
  await migrationClient.end();
})();
