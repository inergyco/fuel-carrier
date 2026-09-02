import { HttpStatus, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { Car } from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditActions,
  AuditEntityType,
} from '@fuel-carrier/shared-types';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  buildAuditContext,
  createAuditChanges,
  diffAuditChanges,
  fetchCompanyName,
  formatAuditCarLabel,
  toAuditSnapshot,
} from '../audit-logs/audit-log.utils';
import { CarTelemetryService } from '../car-telemetry/car-telemetry.service';
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
import type { ApiTenantContext } from '../database/tenant-context.types';
import type { TenantTransaction } from '../database/tenant-db.types';
import { CarDriverAssignmentsService } from './car-driver-assignments.service';
import { CarsReader } from './cars-reader.service';

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
    private readonly carTelemetryService: CarTelemetryService,
    private readonly carsReader: CarsReader,
    private readonly carDriverAssignmentsService: CarDriverAssignmentsService,
  ) {}

  async list(context: ApiTenantContext): Promise<Car[]> {
    return this.tenantDb.run(context, async (tx) => {
      const rows = await tx.select().from(cars).orderBy(desc(cars.createdAt));

      return rows.map(_mapCar);
    });
  }

  async getById(context: ApiTenantContext, id: string): Promise<Car> {
    return this.tenantDb.run(context, (tx) => this.carsReader.getById(tx, id));
  }

  async create(context: ApiTenantContext, dto: CreateCarPayload): Promise<Car> {
    try {
      return await this.tenantDb.run(context, async (tx) => {
        if (dto.driverId) {
          await this._assertDriverAccessible(tx, dto.driverId);
          await this.carDriverAssignmentsService.releaseDriverFromOtherCarInTx(
            tx,
            dto.driverId,
            null,
          );
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

        if (dto.driverId) {
          await this.carDriverAssignmentsService.insertOpenAssignmentInTx(
            tx,
            context,
            {
              carId: row.id,
              driverId: dto.driverId,
              companyId: row.companyId,
            },
          );
        }

        const car = _mapCar(row);
        const companyName = await fetchCompanyName(tx, car.companyId);

        await this.auditLogService.record(context, {
          action: AuditActions.CAR_CREATED,
          companyId: car.companyId,
          entityType: AuditEntityType.CAR,
          entityId: car.id,
          metadata: {
            ...buildAuditContext({
              companyName,
              entityLabel: formatAuditCarLabel(car),
            }),
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
    context: ApiTenantContext,
    id: string,
    dto: UpdateCarPayload,
  ): Promise<Car> {
    return this.tenantDb.run(context, async (tx) => {
      const existing = await this.carsReader.getById(tx, id);

      if (dto.driverId) {
        await this._assertDriverAccessible(tx, dto.driverId);
      }

      const nextCompanyId =
        dto.companyId !== undefined ? dto.companyId : existing.companyId;

      if (dto.driverId !== undefined && dto.driverId !== existing.driverId) {
        await this.carDriverAssignmentsService.syncDriverChangeInTx(
          tx,
          context,
          {
            carId: id,
            companyId: nextCompanyId,
            previousDriverId: existing.driverId,
            nextDriverId: dto.driverId,
          },
        );
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
      const companyName = await fetchCompanyName(tx, car.companyId);

      await this.auditLogService.record(context, {
        action: AuditActions.CAR_UPDATED,
        companyId: car.companyId,
        entityType: AuditEntityType.CAR,
        entityId: car.id,
        metadata: {
          ...buildAuditContext({
            companyName,
            entityLabel: formatAuditCarLabel(car),
          }),
          changes: diffAuditChanges(existing, car, CAR_AUDIT_FIELDS),
        },
      });

      return car;
    });
  }

  async delete(context: ApiTenantContext, id: string): Promise<null> {
    const deleted = await this.tenantDb.run(context, async (tx) => {
      const existing = await this.carsReader.getById(tx, id);

      await this.carDriverAssignmentsService.closeOpenAssignmentsForCarInTx(
        tx,
        id,
      );

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

      const companyName = await fetchCompanyName(tx, existing.companyId);

      await this.auditLogService.record(context, {
        action: AuditActions.CAR_DELETED,
        companyId: existing.companyId,
        entityType: AuditEntityType.CAR,
        entityId: id,
        metadata: {
          ...buildAuditContext({
            companyName,
            entityLabel: formatAuditCarLabel(existing),
          }),
          snapshot: toAuditSnapshot(existing, CAR_AUDIT_FIELDS),
        },
      });

      return { companyId: existing.companyId, carId: id };
    });

    await this.carTelemetryService.clearForCar(
      deleted.companyId,
      deleted.carId,
    );

    return null;
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
