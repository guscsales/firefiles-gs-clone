import { defineConfig } from 'drizzle-kit';
import { env } from './env';

export default defineConfig({
  out: './packages/plugins/database/primary/migrations',
  schema: './packages/plugins/database/primary/schemas/**',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL
  }
});
