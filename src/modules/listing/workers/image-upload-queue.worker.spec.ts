import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DatabaseService } from 'src/services/database/database.service';
import { RedisService } from 'src/services/redis/redis.service';
import { JsonService } from 'src/core/services/json/json.service';
import { ImageUploadQueueWorker } from './image-upload-queue.worker';
import { TypedConfigService } from 'src/config/typed-config.service';
import { ImageUploadService } from 'src/services/image-upload/image-upload.service';
import { ImageUploadJob } from '../types';
import { ImageStatus } from 'src/services/database/generated/prisma/enums';

describe('ListingService', () => {
  let worker: ImageUploadQueueWorker;
  let db: DeepMockProxy<DatabaseService>;
  let redis: DeepMockProxy<RedisService>;
  let json: DeepMockProxy<JsonService>;
  let config: DeepMockProxy<TypedConfigService>;
  let uploadService: DeepMockProxy<ImageUploadService>;

  let getExampleJob = (retries = 0): ImageUploadJob => ({
    id: 1,
    listingId: 1,
    path: '/tmp/test.png',
    storageKey: 'uploads/listing/test.png',
    mimetype: 'image/jpeg',
    retries,
  });

  beforeEach(async () => {
    db = mockDeep<DatabaseService>();
    redis = mockDeep<RedisService>();
    json = mockDeep<JsonService>();
    config = mockDeep<TypedConfigService>();
    uploadService = mockDeep<ImageUploadService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageUploadQueueWorker,
        {
          provide: DatabaseService,
          useValue: db,
        },
        {
          provide: RedisService,
          useValue: redis,
        },
        {
          provide: JsonService,
          useValue: json,
        },
        {
          provide: TypedConfigService,
          useValue: config,
        },
        {
          provide: ImageUploadService,
          useValue: uploadService,
        },
      ],
    }).compile();

    worker = module.get<ImageUploadQueueWorker>(ImageUploadQueueWorker);
  });

  describe('processUpload()', () => {
    it('uploads image, marks as completed, removes from processing queue', async () => {
      const job = getExampleJob(0);

      const jobRaw = JSON.stringify(job);
      uploadService.uploadImage.mockResolvedValue(undefined);
      await worker.processUpload(job, jobRaw);
      expect(uploadService.uploadImage).toHaveBeenCalled();
      expect(db.listingImage.update).toHaveBeenCalledWith({
        where: { id: job.id },
        data: { status: ImageStatus.COMPLETED },
      });
      expect(redis.client.lrem).toHaveBeenCalledWith(
        'image:processing',
        1,
        jobRaw,
      );
    });

    it('sends back to queue if failed to upload for the first time', async () => {
      const job = getExampleJob(0);

      const jobRaw = JSON.stringify(job);
      uploadService.uploadImage.mockRejectedValue(new Error('baubau'));
      json.safeStringify.mockReturnValue(
        JSON.stringify({ ...job, retries: 1 }),
      );
      config.get.mockReturnValue(3);

      await worker.processUpload(job, jobRaw);
      expect(db.listingImage.update).not.toHaveBeenCalled();
      expect(redis.client.lpush).toHaveBeenCalledWith(
        'image:queue',
        JSON.stringify({ ...job, retries: 1 }),
      );
      expect(redis.client.lrem).toHaveBeenCalledWith(
        'image:processing',
        1,
        jobRaw,
      );
    });

    it('sends to the fail queue if fail limit exceeded', async () => {
      const job = getExampleJob(1);
      const jobRaw = JSON.stringify(job);

      config.get.mockReturnValue(1);
      uploadService.uploadImage.mockRejectedValue(new Error('baubau'));
      json.safeStringify.mockReturnValue(
        JSON.stringify({ ...job, retries: 1 }),
      );

      await worker.processUpload(job, jobRaw);
      expect(db.listingImage.update).toHaveBeenCalledWith({
        where: { id: job.id },
        data: { status: ImageStatus.FAILED },
      });
      expect(redis.client.lpush).toHaveBeenCalledWith(
        'image:failed',
        JSON.stringify({ ...job, retries: 1 }),
      );
      expect(redis.client.lrem).toHaveBeenCalledWith(
        'image:processing',
        1,
        jobRaw,
      );
    });
  });

  describe('pollOnce()', () => {
    it('pops the job and processes it', async () => {
      const job = getExampleJob(0);
      const jobRaw = JSON.stringify(job);

      redis.client.rpoplpush.mockResolvedValue(jobRaw);
      json.safeParse.mockReturnValue(job);
      jest.spyOn(worker, 'processUpload');

      await worker.pollOnce();
      expect(worker.processUpload).toHaveBeenCalledWith(job, jobRaw);
    });

    it("doesn't process if over limit of active jobs", async () => {
      worker['activeJobs'] = 5;
      worker['maxConcurrentJobs'] = 5;
      config.get.mockReturnValue(5);

      await worker.pollOnce();
      expect(redis.client.rpoplpush).not.toHaveBeenCalled();
    });
  });

  describe('onModuleInit()', () => {
    it('starts polling on module init', () => {
      const pollSpy = jest.spyOn(worker, 'poll');
      worker.onModuleInit();
      expect(pollSpy).toHaveBeenCalled();

      worker.onModuleDestroy();
    });
  });
});
