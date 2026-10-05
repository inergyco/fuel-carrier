import { Injectable, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { parseZodDto } from '../validation/zod.utils';

/**
 * Nest body/query pipe backed by a Zod schema.
 *
 * Constructor takes an unparameterized `ZodType` so Zod 4 object / refine
 * schemas stay assignable under decorator type-checking. Call sites keep
 * explicit DTO annotations on the handler parameter for output typing.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    return parseZodDto(this.schema, value);
  }
}
