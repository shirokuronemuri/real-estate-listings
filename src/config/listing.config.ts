import { Env } from './env.schema';

export const listingConfig = (env: Env) => ({
  maxImageCount: env.LISTING_MAX_IMAGE_COUNT ?? 1,
  maxFileSizeInMegabytes: env.LISTING_MAX_FILE_SIZE_MB ?? 3,
});
