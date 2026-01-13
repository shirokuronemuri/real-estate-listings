import { createZodDto } from 'nestjs-zod';
import { singleResponse } from 'src/helpers/zod/response-wrapper';
import { stringToDate } from 'src/helpers/zod/string-to-date';
import { z } from 'zod';

export const exampleSchema = z.object({
  id: z.number().int(),
  title: z.string().nonempty(),
  createdAt: stringToDate,
  updatedAt: stringToDate,
});

const wrap = singleResponse(exampleSchema);

export class ExampleDto extends createZodDto(wrap, { codec: true }) {}
