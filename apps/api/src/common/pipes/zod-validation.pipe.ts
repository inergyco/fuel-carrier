import { Injectable, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { parseZodDto } from '../validation/zod.utils';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    return parseZodDto(this.schema, value);
  }
}
