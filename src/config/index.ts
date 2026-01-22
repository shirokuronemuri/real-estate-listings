import { envSchema } from './env.schema';
import { appConfig } from './app.config';
import { listingConfig } from './listing.config';
import { r2Config } from './r2.config';

export type ConfigValues = ReturnType<typeof config>;

const config = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Failed parsing environment variables:');
    console.error(JSON.stringify(parsed.error.issues, null, 2));
    if (process.env.NODE_ENV === 'test') {
      process.exit(1);
    }
    throw new Error('Invalid environment configuration');
  }
  const env = parsed.data;

  return {
    app: appConfig(env),
    db: {
      url: env.DATABASE_URL,
    },
    redis: {
      url: env.REDIS_URL,
    },
    listing: listingConfig(env),
    r2: r2Config(env),
  };
};

export default config;
