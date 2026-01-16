import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createImageUploadSchema = ({
  maxFileSize,
  maxImageCount,
}: {
  maxFileSize: number;
  maxImageCount: number;
}) =>
  z
    .array(
      z.object({
        size: z
          .number()
          .max(
            maxFileSize * 1024 * 1024,
            `Image size must not exceed ${maxFileSize}MB`,
          ),
        mimetype: z.enum(
          ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
          'Unsupported file format; only JPEG/PNG/WEBP/AVIF images are supported',
        ),
      }),
    )
    .min(1, 'You must upload at least one image')
    .max(maxImageCount, `You can't upload more than ${maxImageCount} images`);
