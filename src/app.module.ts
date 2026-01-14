import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ExampleModule } from './modules/example/example.module';
import { ListingModule } from './modules/listing/listing.module';

@Module({
  imports: [CoreModule, ExampleModule, ListingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
