/**
 * Zod validation convention for this API:
 * - Define request/env shapes in `*.dto.ts` files (Zod schema + inferred type).
 * - Use `parseZodDto()` in Nest handlers, guards, and strategies.
 * - Use `@Body(new ZodValidationPipe(schema))` when guards do not read the body first.
 * - Use `parseZodValue()` in standalone scripts (seed, CLI).
 */
import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import type { ZodType, ZodIssue } from 'zod';
import { createApiException } from '../exceptions/api.exception';
import {
  formatFieldErrors,
  zodIssuesToFieldErrors,
} from './field-errors.utils';

export { zodIssuesToFieldErrors } from './field-errors.utils';

export function formatZodIssues(issues: ZodIssue[]): string {
  return formatFieldErrors(zodIssuesToFieldErrors(issues));
}

function parseZodSchema<T>(
  schema: ZodType<T>,
  value: unknown,
  onValidationError: (issues: ZodIssue[]) => never,
): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    onValidationError(result.error.issues);
  }

  return result.data;
}

export function parseZodDto<T>(schema: ZodType<T>, value: unknown): T {
  return parseZodSchema(schema, value, function onValidationError(issues) {
    throw createApiException(
      HttpStatus.BAD_REQUEST,
      ApiErrorCode.VALIDATION_ERROR,
      'Validation failed',
      zodIssuesToFieldErrors(issues),
    );
  });
}

export function parseZodValue<T>(schema: ZodType<T>, value: unknown): T {
  return parseZodSchema(schema, value, function onValidationError(issues) {
    throw new Error(formatZodIssues(issues));
  });
}
