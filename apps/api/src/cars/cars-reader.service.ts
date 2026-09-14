import { HttpStatus, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Car } from '@fuel-carrier/shared-types';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import { toIsoTimestamp } from '../common/iso-timestamp.utils';
import { assertUuidParam } from '../common/validation/uuid.utils';
import { cars } from '../database/schema/cars';
import type { TenantTransaction } from '../database/tenant-db.types';

/** Car lookups that run inside an existing tenant (RLS) transaction. */
@Injectable()
export class CarsReader {
  async getById(tx: TenantTransaction, id: string): Promise<Car> {
    assertUuidParam(id);

    const [row] = await tx.select().from(cars).where(eq(cars.id, id)).limit(1);

    if (!row) {
      throw createApiException(
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
        'Car not found',
      );
    }

    return {
      id: row.id,
      name: row.name,
      licensePlate: row.licensePlate,
      companyId: row.companyId,
      driverId: row.driverId,
      note: row.note,
      status: row.status,
      createdAt: toIsoTimestamp(row.createdAt),
      updatedAt: toIsoTimestamp(row.updatedAt),
    };
  }
}
