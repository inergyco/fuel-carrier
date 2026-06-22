import { HttpStatus, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { Car, TenantContext } from '@fuel-carrier/shared-types';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import { cars } from '../database/schema/cars';
import { drivers } from '../database/schema/drivers';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';

type CreateCarPayload = {
  name?: string | null;
  licensePlate: string;
  companyId: string;
  driverId?: string | null;
  note?: string | null;
};

type UpdateCarPayload = Partial<CreateCarPayload>;

@Injectable()
export class CarsService {
  constructor(private readonly tenantDb: TenantDbService) {}

  async list(context: TenantContext): Promise<Car[]> {
    return this.tenantDb.run(context, async (tx) => {
      const rows = await tx.select().from(cars).orderBy(desc(cars.createdAt));

      return rows.map(_mapCar);
    });
  }

  async getById(context: TenantContext, id: string): Promise<Car> {
    return this.tenantDb.run(context, async (tx) => {
      const [row] = await tx
        .select()
        .from(cars)
        .where(eq(cars.id, id))
        .limit(1);

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Car not found',
        );
      }

      return _mapCar(row);
    });
  }

  async create(context: TenantContext, dto: CreateCarPayload): Promise<Car> {
    return this.tenantDb.run(context, async (tx) => {
      if (dto.driverId) {
        await this._assertDriverAccessible(tx, dto.driverId);
      }

      const [row] = await tx
        .insert(cars)
        .values({
          name: dto.name ?? null,
          licensePlate: dto.licensePlate,
          companyId: dto.companyId,
          driverId: dto.driverId ?? null,
          note: dto.note ?? null,
        })
        .returning();

      return _mapCar(row);
    });
  }

  async update(
    context: TenantContext,
    id: string,
    dto: UpdateCarPayload,
  ): Promise<Car> {
    return this.tenantDb.run(context, async (tx) => {
      if (dto.driverId) {
        await this._assertDriverAccessible(tx, dto.driverId);
      }

      const [row] = await tx
        .update(cars)
        .set({
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.licensePlate !== undefined
            ? { licensePlate: dto.licensePlate }
            : {}),
          ...(dto.companyId !== undefined ? { companyId: dto.companyId } : {}),
          ...(dto.driverId !== undefined ? { driverId: dto.driverId } : {}),
          ...(dto.note !== undefined ? { note: dto.note } : {}),
        })
        .where(eq(cars.id, id))
        .returning();

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Car not found',
        );
      }

      return _mapCar(row);
    });
  }

  async delete(context: TenantContext, id: string): Promise<null> {
    return this.tenantDb.run(context, async (tx) => {
      const [row] = await tx
        .delete(cars)
        .where(eq(cars.id, id))
        .returning({ id: cars.id });

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Car not found',
        );
      }

      return null;
    });
  }

  /**
   * RLS hides drivers from other companies, but we still validate explicitly
   * so callers get a clear business error instead of a silent FK/RLS failure.
   */
  private async _assertDriverAccessible(
    tx: TenantTransaction,
    driverId: string,
  ): Promise<void> {
    const [driver] = await tx
      .select({ id: drivers.id })
      .from(drivers)
      .where(eq(drivers.id, driverId))
      .limit(1);

    if (!driver) {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        'Validation failed',
        [
          {
            field: 'driverId',
            message:
              'Driver not found or does not belong to the current company',
          },
        ],
      );
    }
  }
}

function _mapCar(row: typeof cars.$inferSelect): Car {
  return row;
}
