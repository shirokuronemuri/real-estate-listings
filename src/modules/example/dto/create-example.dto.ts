import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createExampleSchema = z.object({
  title: z.string().nonempty(),
});

export class CreateExampleDto extends createZodDto(createExampleSchema) {}
