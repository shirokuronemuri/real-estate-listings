import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TypedConfigService } from 'src/config/typed-config.service';
import { JsonService } from 'src/core/services/json/json.service';
import { RedisService } from 'src/services/redis/redis.service';
import { ImageUploadJob } from '../types';
import { ImageUploadService } from 'src/services/image-upload/image-upload.service';
import { DatabaseService } from 'src/services/database/database.service';
import { ImageStatus } from 'src/services/database/generated/prisma/enums';

@Injectable()
export class ImageUploadQueueWorker implements OnModuleInit, OnModuleDestroy {
  private activeJobs = 0;
  private running = true;
  constructor(
    private readonly config: TypedConfigService,
    private readonly redis: RedisService,
    private readonly db: DatabaseService,
    private readonly json: JsonService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  onModuleInit() {
    this.requeueActiveJobs();
    this.poll();
  }

  onModuleDestroy() {
    this.running = false;
  }

  async requeueActiveJobs() {}

  async poll() {
    const maxConcurrentJobs = this.config.get(
      'listing.maxConcurrentUploadJobs',
    );
    while (this.running) {
      if (this.activeJobs >= maxConcurrentJobs) {
        await this.sleep(100);
        continue;
      }
      try {
        const jobRaw = await this.redis.client.rpoplpush(
          'image:queue',
          'image:processing',
        );
        const job = this.json.safeParse<ImageUploadJob>(jobRaw);

        if (!jobRaw || !job) {
          await this.sleep(1000);
          continue;
        }

        this.activeJobs++;
        this.processUpload(job, jobRaw).finally(() => {
          this.activeJobs--;
        });
      } catch (e) {
        if (!this.running) break;
        throw e;
      }
    }
  }

  async processUpload(job: ImageUploadJob, jobRaw: string) {
    try {
      await this.imageUploadService.uploadImage(
        job.path,
        job.storageKey,
        job.mimetype,
      );
      await this.db.listingImage.update({
        where: {
          id: job.id,
        },
        data: { status: ImageStatus.COMPLETED },
      });
      await this.redis.client.lrem('image:processing', 1, jobRaw);
    } catch (e) {
      const maxUploadRetries = this.config.get('listing.maxUploadRetries');
      if (job.retries < maxUploadRetries) {
        job.retries++;
        await this.redis.client.lrem('image:processing', 1, jobRaw);
        await this.redis.client.lpush(
          'image:queue',
          this.json.safeStringify(job) ?? '',
        );
      } else {
        await this.db.listingImage.update({
          where: {
            id: job.id,
          },
          data: { status: ImageStatus.FAILED },
        });
        await this.redis.client.lrem('image:processing', 1, jobRaw);
        await this.redis.client.lpush(
          'image:failed',
          this.json.safeStringify(job) ?? '',
        );
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
