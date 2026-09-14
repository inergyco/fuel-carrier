import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../exceptions/api.exception';

/** 8-4-4-4-12 hex; matches what Postgres accepts as `uuid`. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** Reject malformed path/query ids with 400 instead of pretending the entity is missing. */
export function assertUuidParam(value: string, field: string = 'id'): void {
  if (isUuid(value)) {
    return;
  }

  throw createApiException(
    HttpStatus.BAD_REQUEST,
    ApiErrorCode.VALIDATION_ERROR,
    'Validation failed',
    [{ field, message: 'Invalid UUID' }],
  );
}
