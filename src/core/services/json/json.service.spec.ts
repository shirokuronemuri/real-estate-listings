import { Test, TestingModule } from '@nestjs/testing';
import { JsonService } from './json.service';
import { LoggerService } from 'src/core/services/logger/logger.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('JsonService', () => {
  let service: JsonService;
  let logger: DeepMockProxy<LoggerService>;

  beforeEach(async () => {
    logger = mockDeep<LoggerService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JsonService,
        {
          provide: LoggerService,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<JsonService>(JsonService);
  });

  describe('safeStringify()', () => {
    it('should stringify the object', () => {
      const object = { key: 'value' };

      const result = service.safeStringify(object);
      expect(result).toBe(JSON.stringify(object));
    });

    it('should log the error and return undefined if JSON.stringify throws', () => {
      const object = { key: 'value' } as any;
      object.key = object;

      const result = service.safeStringify(object);
      expect(result).toBe(undefined);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('safeParse()', () => {
    it('should parse the object', () => {
      const object = { key: 'value' };
      const stringified = JSON.stringify(object);

      const result = service.safeParse(stringified);
      expect(result).toStrictEqual(object);
    });

    it('should log the error and return undefined if JSON.parse throws', () => {
      const stringified = '{ badjson';

      const result = service.safeParse(stringified);
      expect(result).toBe(undefined);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
