import { Injectable } from '@nestjs/common';
import { CreateExampleDto } from './dto/create-example.dto';
import { QueryParamDto } from 'src/helpers/zod/query-param.dto';
import { paginate } from 'src/helpers/pagination/paginate';
import { generatePaginationLinks } from 'src/helpers/pagination/generate-pagination-links';
import { TypedConfigService } from 'src/config/typed-config.service';

@Injectable()
export class ExampleService {
  constructor(private readonly config: TypedConfigService) {}

  create(createExampleDto: CreateExampleDto) {
    return {
      id: 1,
      title: createExampleDto.title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findAll({ page = 1, limit = 10, filter }: QueryParamDto) {
    const exampleOutput = [
      {
        id: 1,
        title: 'example 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: 'example 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const paginatedResult = await paginate({
      page,
      limit,
      count: () => 2,
      fetch: () => exampleOutput,
    });
    const links = generatePaginationLinks({
      host: this.config.get('app.host'),
      endpoint: '/',
      limit,
      page,
      filter,
      totalPages: paginatedResult.meta.totalPages,
    });
    return {
      data: paginatedResult.data,
      meta: {
        ...paginatedResult.meta,
        ...links,
      },
    };
  }
}
