import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.USE_DOTENV) {
  config({ path: '.env.local' });
}

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith('postgresql://'),
  AI_API_KEY: z.string().min(1),
  REPLICATE_API_KEY: z.string().optional()
});

const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';

export const env = isBuilding
  ? (process.env as unknown as z.infer<typeof envSchema>)
  : envSchema.parse(process.env);
