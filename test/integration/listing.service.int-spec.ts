import { CreateListingDto } from 'src/modules/listing/dto/create-listing.dto';
import { ListingService } from 'src/modules/listing/listing.service';
import { DatabaseService } from 'src/services/database/database.service';
import { app } from 'test/setup';

describe('ListingService', () => {
  let listingService: ListingService;
  let db: DatabaseService;

  beforeAll(() => {
    listingService = app.get(ListingService);
    db = app.get(DatabaseService);
  });

  describe('create()', () => {
    it('creates new listing', async () => {
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
      const images = [
        { mimetype: 'image/jpeg', size: 1024 },
      ] as Express.Multer.File[];
      const result = await listingService.create(newListing, images);
      const dbListing = await db.listing.findUnique({
        where: { id: result.id },
      });
      expect(result).toStrictEqual(dbListing);
    });
  });
});
