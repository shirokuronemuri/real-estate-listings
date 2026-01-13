import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ExampleModule } from './modules/example/example.module';

@Module({
  imports: [CoreModule, ExampleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
