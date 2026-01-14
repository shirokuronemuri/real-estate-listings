import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { positiveCoercedInt } from './positive-coerced-int';

export const queryParamSchema = z.object({
  page: positiveCoercedInt.optional(),
  limit: positiveCoercedInt.optional(),
  filter: z.string().trim().min(1).optional(),
});

export class QueryParamDto extends createZodDto(queryParamSchema) {}
