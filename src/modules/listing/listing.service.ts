import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { DatabaseService } from 'src/services/database/database.service';
import { RedisService } from 'src/services/redis/redis.service';
import { JsonService } from 'src/core/services/json/json.service';
import { ImageUploadJob } from './types';
import { ImageStatus } from 'src/services/database/generated/prisma/enums';

@Injectable()
export class ListingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly json: JsonService,
  ) {}

  async create(
    createListingDto: CreateListingDto,
    images: Express.Multer.File[],
  ) {
    const listing = await this.db.listing.create({
      data: createListingDto,
    });
    const keyedImages = images.map((img) => ({
      ...img,
      storageKey: `uploads/listing/${img.filename}`,
    }));
    const dbImages = await this.db.listingImage.createManyAndReturn({
      data: keyedImages.map((img) => ({
        listingId: listing.id,
        storageKey: img.storageKey,
        mimetype: img.mimetype,
        status: ImageStatus.PROCESSING,
      })),
    });
    const dbImageMap = new Map(dbImages.map((img) => [img.storageKey, img.id]));
    const keyedImagesWithId = keyedImages.map((img) => {
      const id = dbImageMap.get(img.storageKey);
      if (!id) {
        throw new InternalServerErrorException(
          'Failed to match image by storageKey',
        );
      }
      return { ...img, id };
    });

    const uploadJobs: ImageUploadJob[] = keyedImagesWithId.map((img, i) => ({
      id: img.id,
      listingId: listing.id,
      path: img.path,
      storageKey: img.storageKey,
      mimetype: img.mimetype,
      retries: 0,
    }));
    const stringifiedJobs = uploadJobs.map((job) => {
      const result = this.json.safeStringify(job);
      if (!result) throw new InternalServerErrorException();
      return result;
    });
    await this.redis.client.lpush('image:queue', ...stringifiedJobs);

    return listing;
  }
}
