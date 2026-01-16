import { Env } from './env.schema';

export const r2Config = (env: Env) => ({
  endpoint: env.R2_ENDPOINT,
  bucketName: env.R2_BUCKET_NAME,
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
});
