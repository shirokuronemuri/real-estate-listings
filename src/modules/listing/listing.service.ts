import { Injectable } from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { DatabaseService } from 'src/services/database/database.service';

@Injectable()
export class ListingService {
  constructor(private readonly db: DatabaseService) {}

  create(createListingDto: CreateListingDto) {
    return this.db.listing.create({
      data: createListingDto,
    });
  }
}
