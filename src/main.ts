import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { LoggerService } from './core/services/logger/logger.service';
import { TypedConfigService } from './config/typed-config.service';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(LoggerService));
  app.use(helmet());
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest starter')
    .setDescription('Nest starter')
    .setVersion('1.0')
    .addTag('Example', 'Example endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(document), {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: 5,
    },
  });
  const config = app.get<TypedConfigService>(TypedConfigService);
  const port = config.get('app.port');
  app.set('trust proxy', 'loopback');
  await app.listen(port);
}
void bootstrap();
