import { HttpStatus, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { Car, TenantContext } from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditAction,
  AuditEntityType,
} from '@fuel-carrier/shared-types';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  createAuditChanges,
  diffAuditChanges,
  toAuditSnapshot,
} from '../audit-logs/audit-log.utils';
import { createApiException } from '../common/exceptions/api.exception';
import { cars } from '../database/schema/cars';
import { drivers } from '../database/schema/drivers';
import {
  POSTGRES_FOREIGN_KEY_VIOLATION,
  POSTGRES_UNIQUE_VIOLATION,
  type PostgresConstraintMapping,
  rethrowPostgresError,
} from '../database/postgres-error.utils';
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

const CAR_POSTGRES_MAPPINGS: PostgresConstraintMapping[] = [
  {
    code: POSTGRES_UNIQUE_VIOLATION,
    constraint: 'cars_license_plate_unique',
    field: 'licensePlate',
    message: 'A car with this license plate already exists',
  },
  {
    code: POSTGRES_FOREIGN_KEY_VIOLATION,
    constraint: 'cars_company_id_companies_id_fk',
    field: 'companyId',
    message: 'Company not found',
  },
];

@Injectable()
export class CarsService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditLogService: AuditLogService,
  ) {}

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
    try {
      return await this.tenantDb.run(context, async (tx) => {
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

        if (!row) {
          throw createApiException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ApiErrorCode.INTERNAL_ERROR,
            'Failed to create car',
          );
        }

        const car = _mapCar(row);

        await this.auditLogService.record(context, {
          action: AuditAction.CAR_CREATED,
          companyId: car.companyId,
          entityType: AuditEntityType.CAR,
          entityId: car.id,
          metadata: {
            changes: createAuditChanges(car, CAR_AUDIT_FIELDS),
          },
        });

        return car;
      });
    } catch (error) {
      rethrowPostgresError(error, CAR_POSTGRES_MAPPINGS);
    }
  }

  async update(
    context: TenantContext,
    id: string,
    dto: UpdateCarPayload,
  ): Promise<Car> {
    return this.tenantDb.run(context, async (tx) => {
      const [existing] = await tx
        .select()
        .from(cars)
        .where(eq(cars.id, id))
        .limit(1);

      if (!existing) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Car not found',
        );
      }

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

      const car = _mapCar(row);

      await this.auditLogService.record(context, {
        action: AuditAction.CAR_UPDATED,
        companyId: car.companyId,
        entityType: AuditEntityType.CAR,
        entityId: car.id,
        metadata: {
          changes: diffAuditChanges(_mapCar(existing), car, CAR_AUDIT_FIELDS),
        },
      });

      return car;
    });
  }

  async delete(context: TenantContext, id: string): Promise<null> {
    return this.tenantDb.run(context, async (tx) => {
      const [existing] = await tx
        .select()
        .from(cars)
        .where(eq(cars.id, id))
        .limit(1);

      if (!existing) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Car not found',
        );
      }

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

      await this.auditLogService.record(context, {
        action: AuditAction.CAR_DELETED,
        companyId: existing.companyId,
        entityType: AuditEntityType.CAR,
        entityId: id,
        metadata: {
          snapshot: toAuditSnapshot(_mapCar(existing), CAR_AUDIT_FIELDS),
        },
      });

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

const CAR_AUDIT_FIELDS = [
  'name',
  'licensePlate',
  'driverId',
  'note',
] as const satisfies readonly (keyof Car)[];
