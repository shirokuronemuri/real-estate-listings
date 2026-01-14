import { createZodDto } from 'nestjs-zod';
import { singleResponse } from 'src/helpers/zod/response-wrapper';
import { stringToDate } from 'src/helpers/zod/string-to-date';
import z from 'zod';
import { createListingSchema } from './create-listing.dto';

const listingSchema = z.object({
  id: z.number().int(),
  label: z.string().trim().nonempty(),
  addressLine1: z.string().trim().nonempty(),
  addressLine2: z.string().nullable(),
  addressCity: z.string().trim().nonempty(),
  addressProvince: z.string().trim().nonempty(),
  price: z.int().nonnegative(),
  bathrooms: z.int().nonnegative(),
  bedrooms: z.int().nonnegative(),
  squareMeters: z.int().nonnegative(),
  createdAt: stringToDate,
  updatedAt: stringToDate,
});

const wrap = singleResponse(listingSchema);

export class ListingDto extends createZodDto(wrap, { codec: true }) {}
