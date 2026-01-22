import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import helmet from 'helmet';
import { DatabaseService } from '../src/services/database/database.service';
import { RedisService } from '../src/services/redis/redis.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ImageUploadQueueWorker } from 'src/modules/listing/workers/image-upload-queue.worker';
import { rm } from 'fs/promises';
import { TypedConfigService } from 'src/config/typed-config.service';

let app: INestApplication<App>;
let server: App;
let databaseService: DatabaseService;
let redis: RedisService;
let config: TypedConfigService;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .overrideProvider(ImageUploadQueueWorker)
    .useValue({
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
    })
    .compile();

  app = moduleFixture.createNestApplication();
  app.use(helmet());
  await app.init();
  server = app.getHttpServer();
  databaseService = app.get(DatabaseService);
  redis = app.get(RedisService);
  config = app.get(TypedConfigService);
});

beforeEach(async () => {
  await redis.client.flushdb();
  await databaseService.reset();
});

afterAll(async () => {
  await rm(config.get('listing.uploadDir'), { recursive: true, force: true });
  await app.close();
});

export { server, app };
