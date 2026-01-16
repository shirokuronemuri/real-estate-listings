import { Provider } from '@nestjs/common';
import { TypedConfigService } from 'src/config/typed-config.service';
import { S3Client } from '@aws-sdk/client-s3';
export const R2_CLIENT = 'R2_CLIENT';

export const R2Provider: Provider = {
  provide: R2_CLIENT,
  inject: [TypedConfigService],
  useFactory: (config: TypedConfigService) => {
    return new S3Client({
      region: 'auto',
      endpoint: config.get('r2.endpoint'),
      credentials: {
        accessKeyId: config.get('r2.accessKeyId'),
        secretAccessKey: config.get('r2.secretAccessKey'),
      },
      forcePathStyle: true,
    });
  },
};
