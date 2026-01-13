import z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

export const envSchema = z.object({
  // Always required
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.preprocess(emptyToUndefined, z.coerce.number().default(3000)),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  HOST: z.preprocess(emptyToUndefined, z.url().optional()),
});

export type Env = z.infer<typeof envSchema>;
