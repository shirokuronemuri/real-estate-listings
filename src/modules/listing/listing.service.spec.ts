import { Test, TestingModule } from '@nestjs/testing';
import { ListingService } from './listing.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DatabaseService } from 'src/services/database/database.service';
import { CreateListingDto } from './dto/create-listing.dto';

describe('ListingService', () => {
  let listingService: ListingService;
  let db: DeepMockProxy<DatabaseService>;

  beforeEach(async () => {
    db = mockDeep<DatabaseService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        {
          provide: DatabaseService,
          useValue: db,
        },
      ],
    }).compile();

    listingService = module.get<ListingService>(ListingService);
  });

  it('should create new listing', async () => {
    const newListing: CreateListingDto = {
      label: 'label',
      addressCity: 'city',
      addressLine1: 'address',
      addressLine2: null,
      addressProvince: 'province',
      bathrooms: 1,
      bedrooms: 1,
      price: 100,
      squareMeters: 100,
    };
    const dbFields = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.listing.create.mockResolvedValue({ ...newListing, ...dbFields });

    const result = await listingService.create(newListing);
    expect(result).toStrictEqual({ ...newListing, ...dbFields });
    expect(db.listing.create).toHaveBeenCalledTimes(1);
  });
});
