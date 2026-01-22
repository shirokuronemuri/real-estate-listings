import { Env } from './env.schema';

export const listingConfig = (env: Env) => ({
  maxImageCount: env.LISTING_MAX_IMAGE_COUNT ?? 10,
  maxFileSizeInMegabytes: env.LISTING_MAX_FILE_SIZE_MB ?? 3,
  maxConcurrentUploadJobs: env.LISTING_MAX_CONCURRENT_UPLOAD_JOBS ?? 3,
  maxUploadRetries: env.LISTING_MAX_UPLOAD_RETRIES ?? 3,
  uploadDir: env.LISTING_UPLOAD_DIR ?? './upload',
});
