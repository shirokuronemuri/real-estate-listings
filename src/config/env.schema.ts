import z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const baseSchema = z.object({
  // Always required
  PORT: z.preprocess(emptyToUndefined, z.coerce.number().default(3000)),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  HOST: z.preprocess(emptyToUndefined, z.url().optional()),

  // Optional
  LISTING_MAX_IMAGE_COUNT: z.preprocess(
    emptyToUndefined,
    z.coerce.number().optional(),
  ),
  LISTING_MAX_FILE_SIZE_MB: z.preprocess(
    emptyToUndefined,
    z.coerce.number().optional(),
  ),
  LISTING_MAX_CONCURRENT_UPLOAD_JOBS: z.preprocess(
    emptyToUndefined,
    z.coerce.number().optional(),
  ),
  LISTING_MAX_UPLOAD_RETRIES: z.preprocess(
    emptyToUndefined,
    z.coerce.number().optional(),
  ),
  LISTING_UPLOAD_DIR: z.preprocess(emptyToUndefined, z.string().optional()),
});

// Required in dev/prod
const devProdSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  R2_ENDPOINT: z.preprocess(emptyToUndefined, z.string()),
  R2_BUCKET_NAME: z.preprocess(emptyToUndefined, z.string()),
  R2_ACCESS_KEY_ID: z.preprocess(emptyToUndefined, z.string()),
  R2_SECRET_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string()),
});

// Optional in tests
const testSchema = z.object({
  NODE_ENV: z.literal('test'),
  R2_ENDPOINT: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_BUCKET_NAME: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_ACCESS_KEY_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_SECRET_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const envSchema = z.discriminatedUnion('NODE_ENV', [
  baseSchema.extend(devProdSchema.shape),
  baseSchema.extend(testSchema.shape),
]);

export type Env = z.infer<typeof envSchema>;
