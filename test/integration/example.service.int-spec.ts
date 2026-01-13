import { ExampleService } from 'src/modules/example/example.service';
import { app } from '../setup';

describe('ExampleService', () => {
  let exampleService: ExampleService;

  beforeAll(async () => {
    exampleService = app.get(ExampleService);
  });

  describe('create()', () => {
    it('should crete an example object', () => {
      const result = exampleService.create({ title: 'title' });
      expect(result.title).toBe('title');
    });
  });

  describe('findAll()', () => {
    it('pagination should work', async () => {
      const result = await exampleService.findAll({ limit: 10, page: 1 });
      expect(result.data.length).toBe(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.nextPage).toBeNull();
      expect(result.meta.previousPage).toBeNull();
    });
  });
});
