import { createZodDto } from 'nestjs-zod';
import { singleResponse } from 'src/helpers/zod/response-wrapper';
import { stringToDate } from 'src/helpers/zod/string-to-date';
import z from 'zod';
import { createListingSchema } from './create-listing.dto';

const listingSchema = createListingSchema.extend({
  id: z.number().int(),
  createdAt: stringToDate,
  updatedAt: stringToDate,
});

const wrap = singleResponse(listingSchema);

export class ListingDto extends createZodDto(wrap, { codec: true }) {}
