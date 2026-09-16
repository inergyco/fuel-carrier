import { HttpStatus } from '@nestjs/common';
import { createApiException } from '../common/exceptions/api.exception';

/**
 * Reject custody PATCH when the car's driver no longer matches what the client
 * loaded — prevents concurrent assign/end races from both returning 200.
 */
export function assertCustodyPrecondition(options: {
  currentDriverId: string | null;
  expectedDriverId?: string | null;
}): void {
  if (options.expectedDriverId === undefined) {
    return;
  }

  if (options.expectedDriverId === options.currentDriverId) {
    return;
  }

  throw createApiException(
    HttpStatus.CONFLICT,
    'CONFLICT',
    'Car custody changed since this edit started',
    [{ field: 'driverId', message: 'Car custody changed; refresh and retry' }],
  );
}
