import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Inject, Injectable } from '@nestjs/common';
import { readFile, unlink } from 'fs/promises';
import { TypedConfigService } from 'src/config/typed-config.service';
import { R2_CLIENT } from 'src/core/providers/r2.provider';
import { LoggerService } from 'src/core/services/logger/logger.service';

@Injectable()
export class ImageUploadService {
  constructor(
    @Inject(R2_CLIENT) private readonly uploadsClient: S3Client,
    private readonly config: TypedConfigService,
    private readonly logger: LoggerService,
  ) {}

  async uploadImage(path: string, storageKey: string, mimetype: string) {
    const fileBuffer = await readFile(path);

    const upload = new Upload({
      client: this.uploadsClient,
      params: {
        Bucket: this.config.get('r2.bucketName'),
        Key: storageKey,
        Body: fileBuffer,
        ContentType: mimetype,
      },
      queueSize: 1,
    });
    upload.on('httpUploadProgress', (progress) => {
      this.logger.log(
        `${progress.Key}: uploaded ${progress.loaded} out of ${progress.total} bytes`,
        ImageUploadService.name,
      );
    });

    try {
      const result = await upload.done();
      await unlink(path);
      return result.Key;
    } catch (e) {
      this.logger.error(
        `R2 upload failed: ${e instanceof Error ? e.message : ''}`,
        e instanceof Error ? e.stack : undefined,
        ImageUploadService.name,
        { path, storageKey, mimetype },
      );
      throw e;
    }
  }
}
