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

export function getPostgresError(error: unknown): PostgresError | null {
  if (error === null || typeof error !== 'object') {
    return null;
  }

  const pg = error as PostgresError;
  if (!pg.code) {
    return null;
  }

  return pg;
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
