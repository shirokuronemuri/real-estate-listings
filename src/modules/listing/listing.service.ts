import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { DatabaseService } from 'src/services/database/database.service';
import { RedisService } from 'src/services/redis/redis.service';
import { JsonService } from 'src/core/services/json/json.service';
import { nanoid } from 'nanoid';
import { extname } from 'node:path';
import { ImageUploadJob } from './types';

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

    const uploadJobs: ImageUploadJob[] = images.map((img) => ({
      listingId: listing.id,
      path: img.path,
      filename: `${nanoid(12)}${extname(img.path)}`,
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
