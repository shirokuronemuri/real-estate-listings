import { Test, TestingModule } from '@nestjs/testing';
import { ListingService } from './listing.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DatabaseService } from 'src/services/database/database.service';
import { RedisService } from 'src/services/redis/redis.service';
import { JsonService } from 'src/core/services/json/json.service';
import { ImageStatus } from 'src/services/database/generated/prisma/enums';
import { InternalServerErrorException } from '@nestjs/common';

describe('ListingService', () => {
  let listingService: ListingService;
  let db: DeepMockProxy<DatabaseService>;
  let redis: DeepMockProxy<RedisService>;
  let json: DeepMockProxy<JsonService>;

  beforeEach(async () => {
    db = mockDeep<DatabaseService>();
    redis = mockDeep<RedisService>();
    json = mockDeep<JsonService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
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
      ],
    }).compile();

    listingService = module.get<ListingService>(ListingService);
  });

  it('returns created listing', async () => {
    const newListing = { label: 'label' } as any;
    const images = [{ filename: 'image.jpg' }] as Express.Multer.File[];
    const dbImages = [
      {
        id: 1,
        storageKey: 'uploads/listing/image.jpg',
      },
    ] as any;
    db.listing.create.mockResolvedValue({ id: 1, ...newListing });
    db.listingImage.createManyAndReturn.mockResolvedValue(dbImages);
    json.safeStringify.mockReturnValue('{}');

    const result = await listingService.create(newListing, images);
    expect(result).toHaveProperty('id');
  });

  it('calls db and redis with right data', async () => {
    const newListing = { label: 'label' } as any;
    const images = [{ filename: 'image.jpg' }] as Express.Multer.File[];
    const dbImages = [
      {
        id: 1,
        storageKey: 'uploads/listing/image.jpg',
      },
    ] as any;
    db.listing.create.mockResolvedValue({ id: 1, ...newListing });
    db.listingImage.createManyAndReturn.mockResolvedValue(dbImages);
    json.safeStringify.mockReturnValue(JSON.stringify(dbImages));

    await listingService.create(newListing, images);
    expect(db.listing.create).toHaveBeenCalledWith({ data: newListing });
    expect(db.listingImage.createManyAndReturn).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          listingId: 1,
          storageKey: 'uploads/listing/image.jpg',
          status: ImageStatus.PROCESSING,
        }),
      ],
    });
    expect(redis.client.lpush).toHaveBeenCalledWith(
      'image:queue',
      JSON.stringify(dbImages),
    );
  });

  it('throws internal exception if generated key is not upload/listing/[filename]', async () => {
    const newListing = { label: 'label' } as any;
    const images = [{ filename: 'image.jpg' }] as Express.Multer.File[];
    const dbImages = [
      {
        id: 1,
        storageKey: 'image.jpg',
      },
    ] as any;
    db.listing.create.mockResolvedValue({ id: 1, ...newListing });
    db.listingImage.createManyAndReturn.mockResolvedValue(dbImages);
    json.safeStringify.mockReturnValue('{}');

    await expect(listingService.create(newListing, images)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('throws internal exception if json.safeStringify returns undefined', async () => {
    const newListing = { label: 'label' } as any;
    const images = [{ filename: 'image.jpg' }] as Express.Multer.File[];
    const dbImages = [
      {
        id: 1,
        storageKey: 'image.jpg',
      },
    ] as any;
    db.listing.create.mockResolvedValue({ id: 1, ...newListing });
    db.listingImage.createManyAndReturn.mockResolvedValue(dbImages);
    json.safeStringify.mockReturnValue(undefined);

    await expect(listingService.create(newListing, images)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
