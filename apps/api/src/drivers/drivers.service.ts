import { HttpStatus, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { Driver, TenantContext } from '@fuel-carrier/shared-types';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import { drivers } from '../database/schema/drivers';
import { TenantDbService } from '../database/tenant-db.service';

type CreateDriverPayload = {
  firstName: string;
  lastName: string;
  nationalId: string;
  companyId: string;
};

type UpdateDriverPayload = Partial<CreateDriverPayload>;

@Injectable()
export class DriversService {
  constructor(private readonly tenantDb: TenantDbService) {}

  async list(context: TenantContext): Promise<Driver[]> {
    return this.tenantDb.run(context, async (tx) => {
      const rows = await tx
        .select()
        .from(drivers)
        .orderBy(desc(drivers.createdAt));

      return rows.map(_mapDriver);
    });
  }

  async getById(context: TenantContext, id: string): Promise<Driver> {
    return this.tenantDb.run(context, async (tx) => {
      const [row] = await tx
        .select()
        .from(drivers)
        .where(eq(drivers.id, id))
        .limit(1);

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Driver not found',
        );
      }

      return _mapDriver(row);
    });
  }

  async create(
    context: TenantContext,
    dto: CreateDriverPayload,
  ): Promise<Driver> {
    return this.tenantDb.run(context, async (tx) => {
      const [row] = await tx.insert(drivers).values(dto).returning();
      return _mapDriver(row);
    });
  }

  async update(
    context: TenantContext,
    id: string,
    dto: UpdateDriverPayload,
  ): Promise<Driver> {
    return this.tenantDb.run(context, async (tx) => {
      const [row] = await tx
        .update(drivers)
        .set(dto)
        .where(eq(drivers.id, id))
        .returning();

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Driver not found',
        );
      }

      return _mapDriver(row);
    });
  }

  async delete(context: TenantContext, id: string): Promise<null> {
    return this.tenantDb.run(context, async (tx) => {
      const [row] = await tx
        .delete(drivers)
        .where(eq(drivers.id, id))
        .returning({ id: drivers.id });

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Driver not found',
        );
      }

      return null;
    });
  }
}

function _mapDriver(row: typeof drivers.$inferSelect): Driver {
  return row;
}
