import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { normalizeResponse } from 'src/helpers/response/normalize-response';
import { ListingDto } from './dto/listing.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from './pipes/image-validation/image-validation.pipe';
import { unlink } from 'node:fs/promises';

@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Post('')
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: 'create new listing' })
  @ZodResponse({
    type: ListingDto,
    status: 201,
    description: 'Creates new listing',
  })
  async create(
    @Body() createListingDto: CreateListingDto,
    @UploadedFiles(ImageValidationPipe) images: Express.Multer.File[],
  ) {
    const result = await this.listingService.create(createListingDto, images);
    return normalizeResponse(result);
  }
}
