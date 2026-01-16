import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageUploadQueueWorker } from './workers/image-upload-queue.worker';
import { ImageUploadService } from 'src/services/image-upload/image-upload.service';
import { extname } from 'path';
import { nanoid } from 'nanoid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './upload',
        filename: (_, file, cb) => {
          const name = `${nanoid(12)}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
    }),
  ],
  controllers: [ListingController],
  providers: [ListingService, ImageUploadQueueWorker, ImageUploadService],
})
export class ListingModule {}
