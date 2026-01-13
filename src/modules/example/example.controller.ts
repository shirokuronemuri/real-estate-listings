import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ExampleService } from './example.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiOperation } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { normalizeResponse } from 'src/helpers/response/normalize-response';
import { QueryParamDto } from 'src/helpers/zod/query-param.dto';
import { ExampleDto } from './dto/example.dto';
import { CreateExampleDto } from './dto/create-example.dto';
import { ExampleArrayDto } from './dto/example-array.dto';

@UseGuards(ThrottlerGuard)
@Controller('')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post('')
  @ApiOperation({ summary: 'Example POST endpoint' })
  @ZodResponse({
    type: ExampleDto,
    status: 201,
    description: 'Creates example object',
  })
  create(@Body() createExampleDto: CreateExampleDto) {
    const result = this.exampleService.create(createExampleDto);
    return normalizeResponse(result);
  }

  @Get('')
  @ApiOperation({ summary: 'Example GET endpoint' })
  @ZodResponse({
    type: ExampleArrayDto,
    status: 200,
    description: 'Returns array of example objects',
  })
  async findAll(@Query() queryParams: QueryParamDto) {
    const result = await this.exampleService.findAll(queryParams);
    return normalizeResponse(result);
  }
}
