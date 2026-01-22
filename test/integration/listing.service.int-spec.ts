import { CreateListingDto } from 'src/modules/listing/dto/create-listing.dto';
import { ListingService } from 'src/modules/listing/listing.service';
import { DatabaseService } from 'src/services/database/database.service';
import { ImageStatus } from 'src/services/database/generated/prisma/enums';
import { RedisService } from 'src/services/redis/redis.service';
import { app } from 'test/setup';

describe('ListingService', () => {
  let listingService: ListingService;
  let db: DatabaseService;
  let redis: RedisService;

  const getExampleListing = (): CreateListingDto => ({
    label: 'label',
    addressCity: 'city',
    addressLine1: 'address',
    addressLine2: null,
    addressProvince: 'province',
    bathrooms: 1,
    bedrooms: 1,
    price: 100,
    squareMeters: 100,
  });

  beforeAll(() => {
    listingService = app.get(ListingService);
    db = app.get(DatabaseService);
    redis = app.get(RedisService);
  });

  describe('create()', () => {
    it('creates new listing', async () => {
      const newListing = getExampleListing();
      const images = [
        { mimetype: 'image/jpeg', size: 1024 },
      ] as Express.Multer.File[];
      const result = await listingService.create(newListing, images);
      const dbListing = await db.listing.findUnique({
        where: { id: result.id },
      });
      expect(result).toStrictEqual(dbListing);
    });

    it('creates images with PROCESSING status', async () => {
      const newListing = getExampleListing();
      const images = [
        { mimetype: 'image/jpeg', size: 1024 },
      ] as Express.Multer.File[];
      const result = await listingService.create(newListing, images);
      const dbImages = await db.listingImage.findMany({
        where: { listingId: result.id },
      });
      expect(dbImages).toHaveLength(images.length);
      expect(dbImages[0]?.status).toBe(ImageStatus.PROCESSING);
    });

    it('pushes jobs to redis queue', async () => {
      const newListing = getExampleListing();
      const images = [
        { mimetype: 'image/jpeg', size: 1024, filename: '1.jpg' },
        { mimetype: 'image/jpeg', size: 1024, filename: '2.jpg' },
      ] as Express.Multer.File[];
      const result = await listingService.create(newListing, images);
      const jobs = await redis.client.lrange('image:queue', 0, -1);
      expect(jobs.length).toBe(2);
      expect(() => JSON.parse(jobs[0]!)).not.toThrow();
    });
  });
});
