import { Injectable, PipeTransform } from '@nestjs/common';
import { createImageUploadSchema } from '../../dto/image-upload-schema';
import { TypedConfigService } from 'src/config/typed-config.service';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  constructor(private readonly config: TypedConfigService) {}

  transform(files: Express.Multer.File[]) {
    const validationSchema = createImageUploadSchema({
      maxFileSize: this.config.get('listing.maxFileSizeInMegabytes'),
      maxImageCount: this.config.get('listing.maxImageCount'),
    });
    ZodValidationException;
    const result = validationSchema.safeParse(files);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        ...issue,
        path: ['images', ...issue.path],
      }));
      throw new ZodValidationException(new ZodError(issues));
    }

    return files;
  }
}
