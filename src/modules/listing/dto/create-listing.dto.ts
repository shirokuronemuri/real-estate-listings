import { createZodDto } from 'nestjs-zod';
import { Listing } from 'src/services/database/generated/prisma/client';
import z from 'zod';

export const createListingSchema = z.object({
  label: z.string().trim().nonempty(),
  addressLine1: z.string().trim().nonempty(),
  addressLine2: z.string().trim().nonempty().nullable(),
  addressCity: z.string().trim().nonempty(),
  addressProvince: z.string().trim().nonempty(),
  price: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  bedrooms: z.number().int().min(0),
  squareMeters: z.number().int().min(0),
});

type CreateListingFields = Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>;

export class CreateListingDto
  extends createZodDto(createListingSchema)
  implements CreateListingFields {}
