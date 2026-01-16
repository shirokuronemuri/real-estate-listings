import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { QueueService } from 'src/modules/listing/queue.service';

@Module({
  controllers: [ListingController],
  providers: [ListingService, QueueService],
})
export class ListingModule {}
