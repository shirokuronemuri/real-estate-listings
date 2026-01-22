import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageUploadQueueWorker } from './workers/image-upload-queue.worker';
import { ImageUploadService } from 'src/services/image-upload/image-upload.service';
import { extname } from 'path';
import { nanoid } from 'nanoid';
import { TypedConfigService } from 'src/config/typed-config.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [TypedConfigService],
      useFactory: (config: TypedConfigService) => ({
        storage: diskStorage({
          destination: config.get('listing.uploadDir'),
          filename: (_, file, cb) => {
            const name = `${nanoid(12)}${extname(file.originalname)}`;
            cb(null, name);
          },
        }),
      }),
    }),
  ],
  controllers: [ListingController],
  providers: [ListingService, ImageUploadQueueWorker, ImageUploadService],
})
export class ListingModule {}
