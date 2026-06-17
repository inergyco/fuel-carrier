/**
 * Zod validation convention for this API:
 * - Define request/env shapes in `*.dto.ts` files (Zod schema + inferred type).
 * - Use `parseZodDto()` in Nest handlers, guards, and strategies.
 * - Use `@Body(new ZodValidationPipe(schema))` when guards do not read the body first.
 * - Use `parseZodValue()` in standalone scripts (seed, CLI).
 */
import { BadRequestException } from '@nestjs/common';
import type { ZodType, ZodIssue } from 'zod';

export function formatZodIssues(issues: ZodIssue[]): string {
  return issues
    .map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join('; ');
}

function parseZodSchema<T>(
  schema: ZodType<T>,
  value: unknown,
  onValidationError: (message: string) => never,
): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    onValidationError(formatZodIssues(result.error.issues));
  }

  return result.data;
}

export function parseZodDto<T>(schema: ZodType<T>, value: unknown): T {
  return parseZodSchema(schema, value, (message) => {
    throw new BadRequestException(message);
  });
}

export function parseZodValue<T>(schema: ZodType<T>, value: unknown): T {
  return parseZodSchema(schema, value, (message) => {
    throw new Error(message);
  });
}
