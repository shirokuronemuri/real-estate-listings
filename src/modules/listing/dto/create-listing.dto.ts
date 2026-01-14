import { createZodDto } from 'nestjs-zod';
import { nullIfEmptyString } from 'src/helpers/zod/null-if-empty-string';
import { positiveCoercedInt } from 'src/helpers/zod/positive-coerced-int';
import { Listing } from 'src/services/database/generated/prisma/client';
import z from 'zod';

export const createListingSchema = z.object({
  label: z.string().trim().nonempty(),
  addressLine1: z.string().trim().nonempty(),
  addressLine2: nullIfEmptyString,
  addressCity: z.string().trim().nonempty(),
  addressProvince: z.string().trim().nonempty(),
  price: positiveCoercedInt,
  bathrooms: positiveCoercedInt,
  bedrooms: positiveCoercedInt,
  squareMeters: positiveCoercedInt,
});

type CreateListingFields = Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>;

export class CreateListingDto
  extends createZodDto(createListingSchema)
  implements CreateListingFields {}
