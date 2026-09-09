import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';

export const POSTGRES_UNIQUE_VIOLATION = '23505';
export const POSTGRES_FOREIGN_KEY_VIOLATION = '23503';

export type PostgresError = {
  code?: string;
  constraint?: string;
};

export type PostgresConstraintMapping = {
  code:
    | typeof POSTGRES_UNIQUE_VIOLATION
    | typeof POSTGRES_FOREIGN_KEY_VIOLATION;
  constraint: string;
  field: string;
  message: string;
};

/**
 * Drizzle (and some drivers) wrap node-pg errors in `cause`. Walk the chain so
 * unique/FK mappings still match.
 */
export function getPostgresError(error: unknown): PostgresError | null {
  let current: unknown = error;
  const seen = new Set<object>();
  let fallback: PostgresError | null = null;

  while (current !== null && typeof current === 'object') {
    if (seen.has(current)) {
      break;
    }
    seen.add(current);

    const candidate = current as PostgresError & { cause?: unknown };
    if (typeof candidate.code === 'string') {
      const pg: PostgresError = {
        code: candidate.code,
        ...(typeof candidate.constraint === 'string'
          ? { constraint: candidate.constraint }
          : {}),
      };

      if (pg.constraint) {
        return pg;
      }

      fallback ??= pg;
    }

    current = 'cause' in candidate ? candidate.cause : undefined;
  }

  return fallback;
}

/** Map known PostgreSQL constraint errors to API validation responses; rethrow the rest. */
export function rethrowPostgresError(
  error: unknown,
  mappings: PostgresConstraintMapping[] = [],
): never {
  const pg = getPostgresError(error);
  if (!pg?.constraint) {
    throw error;
  }

  const match = mappings.find(
    (mapping) =>
      mapping.code === pg.code && mapping.constraint === pg.constraint,
  );

  if (match) {
    throw createApiException(
      HttpStatus.BAD_REQUEST,
      ApiErrorCode.VALIDATION_ERROR,
      'Validation failed',
      [{ field: match.field, message: match.message }],
    );
  }

  throw error;
}
