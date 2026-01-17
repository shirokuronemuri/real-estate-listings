import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadService } from './image-upload.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { S3Client } from '@aws-sdk/client-s3';
import { TypedConfigService } from 'src/config/typed-config.service';
import { LoggerService } from 'src/core/services/logger/logger.service';
import { R2_CLIENT } from 'src/core/providers/r2.provider';
import { readFile, unlink } from 'node:fs/promises';
import { Upload } from '@aws-sdk/lib-storage';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  unlink: jest.fn(),
}));
const uploadMock = {
  on: jest.fn(),
  done: jest.fn(),
};
jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn(() => uploadMock),
}));

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let uploadsClient: DeepMockProxy<S3Client>;
  let config: DeepMockProxy<TypedConfigService>;
  let logger: DeepMockProxy<LoggerService>;

  beforeEach(async () => {
    uploadsClient = mockDeep<S3Client>();
    config = mockDeep<TypedConfigService>();
    logger = mockDeep<LoggerService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageUploadService,
        {
          provide: R2_CLIENT,
          useValue: uploadsClient,
        },
        {
          provide: LoggerService,
          useValue: logger,
        },
        {
          provide: TypedConfigService,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<ImageUploadService>(ImageUploadService);
    jest.clearAllMocks();
  });

  describe('uploadImage()', () => {
    it('uploads image and deletes the file', async () => {
      const image = {
        path: 'upload/image.jpg',
        storageKey: 'uploads/listing/image.jpg',
        mimetype: 'image/jpeg',
      };
      (readFile as jest.Mock).mockResolvedValue(Buffer.from('image'));
      uploadMock.done.mockResolvedValue({ Key: image.storageKey });

      const result = await service.uploadImage(
        image.path,
        image.storageKey,
        image.mimetype,
      );

      expect(readFile).toHaveBeenCalledWith(image.path);
      expect(Upload).toHaveBeenCalledTimes(1);
      expect(uploadMock.on).toHaveBeenCalledWith(
        'httpUploadProgress',
        expect.any(Function),
      );
      expect(uploadMock.done).toHaveBeenCalled();
      expect(unlink).toHaveBeenCalledWith(image.path);
      expect(result).toBe(image.storageKey);
    });

    it('logs and rethrows if download failed', async () => {
      const image = {
        path: 'upload/image.jpg',
        storageKey: 'uploads/listing/image.jpg',
        mimetype: 'image/jpeg',
      };
      (readFile as jest.Mock).mockResolvedValue(Buffer.from('image'));
      uploadMock.done.mockRejectedValue(new Error('wafu'));

      await expect(
        service.uploadImage(image.path, image.storageKey, image.mimetype),
      ).rejects.toThrow('wafu');

      expect(unlink).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
