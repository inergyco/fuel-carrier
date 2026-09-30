import { HttpStatus } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import { drivers } from '../database/schema/drivers';
import type { TenantTransaction } from '../database/tenant-db.types';

/**
 * Driver must share companyId and be live. RLS hides other-company drivers
 * for company users; internal admins see all drivers, so this check is required.
 */
export async function assertDriverAssignableToCompany(
  tx: TenantTransaction,
  driverId: string,
  companyId: string,
): Promise<void> {
  const [driver] = await tx
    .select({
      id: drivers.id,
      companyId: drivers.companyId,
      deletedAt: drivers.deletedAt,
    })
    .from(drivers)
    .where(and(eq(drivers.id, driverId), isNull(drivers.deletedAt)))
    .limit(1);

  if (!driver || driver.companyId !== companyId) {
    throw createApiException(
      HttpStatus.BAD_REQUEST,
      ApiErrorCode.VALIDATION_ERROR,
      'Validation failed',
      [
        {
          field: 'driverId',
          message: 'Driver must belong to the same company as the car',
        },
      ],
    );
  }
}
