import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/env';
import { schema } from './schema-map';

/*
 * Create a type-safe reference to store the database client on the global object.
 * This allows us to reuse the same client instance across hot reloads in development.
 */
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

/*
 * Create the PostgreSQL connection client
 */
const client = postgres(env.DATABASE_URL);

/*
 * Create a single Drizzle client instance. In development, this will reuse an existing
 * client from global storage if available, otherwise create a new one.
 * In production, this will always create a fresh client instance.
 */
export const db = globalForDb.db ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}
