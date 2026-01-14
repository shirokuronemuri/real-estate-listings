import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { normalizeResponse } from 'src/helpers/response/normalize-response';
import { ListingDto } from './dto/listing.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Post('')
  @UseInterceptors(FilesInterceptor('images', 1))
  @ApiOperation({ summary: 'create new listing' })
  @ZodResponse({
    type: ListingDto,
    status: 201,
    description: 'Creates new listing',
  })
  async create(
    @Body() createListingDto: CreateListingDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp|avif|tiff)$/,
          }),
        ],
      }),
    )
    images: Express.Multer.File[],
  ) {
    const result = await this.listingService.create(createListingDto, images);
    return normalizeResponse(result);
  }
}
