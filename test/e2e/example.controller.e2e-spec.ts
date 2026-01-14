import request from 'supertest';
import { server } from '../setup';

describe('ExampleController (e2e)', () => {
  describe('POST /', () => {
    it('returns 201 and example object', async () => {
      await request(server)
        .post('/')
        .send({ title: 'example' })
        .expect(201)
        .expect(({ body: { data } }) => {
          expect(data).toMatchObject({
            title: 'example',
            id: 1,
          });
          expect(data).toHaveProperty('createdAt');
          expect(data).toHaveProperty('updatedAt');
        });
    });

    it('returns 400 if missing property', async () => {
      await request(server).post('/').expect(400);
    });
  });

  describe('GET /', () => {
    it('returns example list', async () => {
      await request(server)
        .get('/')
        .query({ limit: 10, page: 1 })
        .expect(200)
        .expect(({ body: { data, meta } }) => {
          expect(data).toHaveLength(2);
          expect(meta).toMatchObject({
            totalCount: 2,
            currentPage: 1,
            totalPages: 1,
            perPage: 10,
            nextPage: null,
            previousPage: null,
          });
        });
    });
  });
});
