import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/core/services/logger/logger.service';

@Injectable()
export class JsonService {
  constructor(private readonly logger: LoggerService) {}

  safeStringify(value: unknown) {
    try {
      const stringValue = JSON.stringify(value);
      return stringValue;
    } catch (e) {
      this.logger.error(
        `Failed stringifying the value: ${e instanceof Error ? e.message : ''}`,
        e instanceof Error ? e.stack : undefined,
        JsonService.name,
        value,
      );
    }
  }

  safeParse<T = unknown>(stringValue: string): T | undefined {
    try {
      const value = JSON.parse(stringValue) as T;
      return value;
    } catch (e) {
      this.logger.error(
        `Failed parsing the value: ${e instanceof Error ? e.message : ''}`,
        e instanceof Error ? e.stack : undefined,
        JsonService.name,
        stringValue,
      );
    }
  }
}
