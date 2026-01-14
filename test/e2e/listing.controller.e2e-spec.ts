import { CreateListingDto } from 'src/modules/listing/dto/create-listing.dto';
import request from 'supertest';
import { server } from '../setup';

describe('ListingController (e2e)', () => {
  it('should create listing', async () => {
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
    await request(server)
      .post('/listing')
      .send(newListing)
      .expect(201)
      .expect(({ body: { data } }) => {
        expect(data).toMatchObject(newListing);
      });
  });
});
