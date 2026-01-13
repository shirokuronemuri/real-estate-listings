import { Test, TestingModule } from '@nestjs/testing';
import { ExampleService } from './example.service';
import { TypedConfigService } from 'src/config/typed-config.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { paginate } from 'src/helpers/pagination/paginate';
import { generatePaginationLinks } from 'src/helpers/pagination/generate-pagination-links';

jest.mock('src/helpers/pagination/paginate', () => ({
  paginate: jest.fn(),
}));
jest.mock('src/helpers/pagination/generate-pagination-links', () => ({
  generatePaginationLinks: jest.fn(),
}));

describe('ExampleService', () => {
  let exampleService: ExampleService;
  let config: DeepMockProxy<TypedConfigService>;

  beforeEach(async () => {
    config = mockDeep<TypedConfigService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: TypedConfigService,
          useValue: config,
        },
      ],
    }).compile();

    exampleService = module.get<ExampleService>(ExampleService);
  });

  describe('create()', () => {
    it('returns example object', () => {
      const result = exampleService.create({ title: 'title' });
      expect(result.title).toBe('title');
    });
  });

  describe('findAll()', () => {
    it('returns paginated objects', async () => {
      const query = {
        page: 1,
        limit: 10,
      };
      const data = [
        { id: 'a', title: 'nya1' },
        { id: 'b', title: 'nya2' },
      ];
      const meta = {
        currentPage: 1,
        limit: 10,
        totalCount: 2,
        totalPages: 1,
      };
      (paginate as jest.Mock).mockImplementation(() => ({
        data,
        meta,
      }));
      const pages = {
        nextPage: null,
        previousPage: null,
      };
      (generatePaginationLinks as jest.Mock).mockReturnValue(pages);
      config.get.mockReturnValue('host');

      const result = await exampleService.findAll(query);

      expect(paginate).toHaveBeenCalledWith(
        expect.objectContaining({
          ...query,
          fetch: expect.any(Function),
          count: expect.any(Function),
        }),
      );
      expect(generatePaginationLinks).toHaveBeenCalledWith({
        host: 'host',
        endpoint: '/',
        ...query,
        totalPages: meta.totalPages,
      });
      expect(result).toStrictEqual({
        data,
        meta: {
          ...meta,
          ...pages,
        },
      });
    });
  });
});
