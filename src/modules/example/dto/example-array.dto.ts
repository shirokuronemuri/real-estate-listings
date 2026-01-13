import { createZodDto } from 'nestjs-zod';
import { paginatedResponse } from 'src/helpers/zod/response-wrapper';
import { exampleSchema } from './example.dto';

const exampleArraySchema = paginatedResponse(exampleSchema);

export class ExampleArrayDto extends createZodDto(exampleArraySchema, {
  codec: true,
}) {}
