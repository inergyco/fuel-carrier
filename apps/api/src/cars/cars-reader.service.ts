import { HttpStatus, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import type { Car, CarDriverSummary } from '@fuel-carrier/shared-types';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import { toIsoTimestamp } from '../common/iso-timestamp.utils';
import { assertUuidParam } from '../common/validation/uuid.utils';
import { cars } from '../database/schema/cars';
import { drivers } from '../database/schema/drivers';
import type { TenantTransaction } from '../database/tenant-db.types';

type CarRow = typeof cars.$inferSelect;
type DriverRow = typeof drivers.$inferSelect;

/** Car lookups that run inside an existing tenant (RLS) transaction. */
@Injectable()
export class CarsReader {
  /** Live car only — soft-deleted rows look like not found. */
  async getById(tx: TenantTransaction, id: string): Promise<Car> {
    assertUuidParam(id);

    const row = await tx.query.cars.findFirst({
      where: and(eq(cars.id, id), isNull(cars.deletedAt)),
      with: { driver: true },
    });

    if (!row) {
      throw createApiException(
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
        'Car not found',
      );
    }

    return mapCarRow(row, row.driver);
  }

  /** Includes soft-deleted rows (for idempotent DELETE). */
  async getByIdIncludingDeleted(
    tx: TenantTransaction,
    id: string,
  ): Promise<Car> {
    assertUuidParam(id);

    const row = await tx.query.cars.findFirst({
      where: eq(cars.id, id),
      with: { driver: true },
    });

    if (!row) {
      throw createApiException(
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
        'Car not found',
      );
    }

    return mapCarRow(row, row.driver);
  }
}

export function mapCarDriverSummary(
  driverRow: DriverRow | null | undefined,
): CarDriverSummary | null {
  if (!driverRow || driverRow.deletedAt) {
    return null;
  }

  return {
    id: driverRow.id,
    firstName: driverRow.firstName,
    lastName: driverRow.lastName,
    mobileNumber: driverRow.mobileNumber,
  };
}

export function mapCarRow(row: CarRow, driverRow?: DriverRow | null): Car {
  return {
    id: row.id,
    name: row.name,
    licensePlate: row.licensePlate,
    companyId: row.companyId,
    driverId: row.driverId,
    driver: mapCarDriverSummary(driverRow),
    hasHighGrade: row.hasHighGrade,
    note: row.note,
    deletedAt: row.deletedAt ? toIsoTimestamp(row.deletedAt) : null,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
  };
}
