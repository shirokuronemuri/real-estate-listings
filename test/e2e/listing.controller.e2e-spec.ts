import { CreateListingDto } from 'src/modules/listing/dto/create-listing.dto';
import request from 'supertest';
import { server } from '../setup';

describe('ListingController (e2e)', () => {
  it('should create listing', async () => {
    await request(server)
      .post('/listing')
      .field('label', 'label')
      .field('addressCity', 'city')
      .field('addressLine1', 'line1')
      .field('addressLine2', 'line2')
      .field('addressProvince', 'province')
      .field('bathrooms', '1')
      .field('bedrooms', '1')
      .field('price', '1')
      .field('squareMeters', '1')
      .field('images', Buffer.from('fakeimage'), {
        filename: 'test.png',
        contentType: 'image/jpeg',
      })
      .expect(201)
      .expect(({ body: { data } }) => {
        expect(data).toHaveProperty('id');
      });
  });
  it('should return 400 if validation failed', async () => {
    await request(server)
      .post('/listing')
      .field('addressCity', 'city')
      .field('addressLine1', 'line1')
      .field('addressLine2', 'line2')
      .field('addressProvince', 'province')
      .field('bathrooms', '1')
      .field('bedrooms', '1')
      .field('price', '1')
      .field('squareMeters', '1')
      .field('images', Buffer.from('fakeimage'), {
        filename: 'test.png',
        contentType: 'image/jpeg',
      })
      .expect(400);
  });
});
