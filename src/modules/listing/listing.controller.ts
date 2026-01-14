import { Controller, Post, Body } from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { normalizeResponse } from 'src/helpers/response/normalize-response';
import { ListingDto } from './dto/listing.dto';

@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Post('')
  @ApiOperation({ summary: 'create new listing' })
  @ZodResponse({
    type: ListingDto,
    status: 201,
    description: 'Creates new listing',
  })
  async create(@Body() createListingDto: CreateListingDto) {
    const result = await this.listingService.create(createListingDto);
    return normalizeResponse(result);
  }
}
