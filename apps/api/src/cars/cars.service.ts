import { HttpStatus, Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import type {
  Car,
  PaginatedResult,
  PaginationParams,
} from '@fuel-carrier/shared-types';
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
import {
  toPaginatedResult,
  getPaginationOffset,
} from '../common/pagination.utils';
import { createApiException } from '../common/exceptions/api.exception';
import { toIsoTimestamp } from '../common/iso-timestamp.utils';
import { assertUuidParam } from '../common/validation/uuid.utils';
import { cars } from '../database/schema/cars';
import { ENTITY_STATUS } from '../database/schema/entity-status';
import { drivers } from '../database/schema/drivers';
import { rethrowPostgresError } from '../database/postgres-error.utils';
import { TenantDbService } from '../database/tenant-db.service';
import type { ApiTenantContext } from '../database/tenant-context.types';
import type { TenantTransaction } from '../database/tenant-db.types';
import { CarDriverAssignmentsService } from './car-driver-assignments.service';
import { CAR_POSTGRES_MAPPINGS } from './cars-postgres-mappings';
import { CarsReader } from './cars-reader.service';

type CreateCarPayload = {
  name?: string | null;
  licensePlate: string;
  companyId: string;
  driverId?: string | null;
  note?: string | null;
};

type UpdateCarPayload = Partial<CreateCarPayload>;

type ListCarsOptions = PaginationParams & {
  companyId?: string;
};

@Injectable()
export class CarsService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditLogService: AuditLogService,
    private readonly carsReader: CarsReader,
    private readonly carDriverAssignmentsService: CarDriverAssignmentsService,
  ) {}

  async list(
    context: ApiTenantContext,
    options: ListCarsOptions,
  ): Promise<PaginatedResult<Car>> {
    const { page, limit, companyId } = options;
    if (companyId) {
      assertUuidParam(companyId, 'companyId');
    }

    const offset = getPaginationOffset(options);
    const where = and(
      eq(cars.status, ENTITY_STATUS.ACTIVE),
      companyId ? eq(cars.companyId, companyId) : undefined,
    );

    return this.tenantDb.run(context, async (tx) => {
      const [countRow] = await tx
        .select({ value: count() })
        .from(cars)
        .where(where);

      const rows = await tx
        .select()
        .from(cars)
        .where(where)
        .orderBy(desc(cars.createdAt))
        .limit(limit)
        .offset(offset);

      return toPaginatedResult({
        items: rows.map(_mapCar),
        page,
        limit,
        totalItems: countRow?.value ?? 0,
      });
    });
  }

  async getById(context: ApiTenantContext, id: string): Promise<Car> {
    return this.tenantDb.run(context, (tx) => this.carsReader.getById(tx, id));
  }

  async create(context: ApiTenantContext, dto: CreateCarPayload): Promise<Car> {
    try {
      return await this.tenantDb.run(context, async (tx) => {
        if (dto.driverId) {
          await this._assertDriverAssignableToCompany(
            tx,
            dto.driverId,
            dto.companyId,
          );
          await this.carDriverAssignmentsService.releaseDriverFromOtherCarInTx(
            tx,
            {
              driverId: dto.driverId,
              exceptCarId: null,
            },
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
            status: ENTITY_STATUS.ACTIVE,
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
    try {
      return await this.tenantDb.run(context, async (tx) => {
        if (dto.driverId !== undefined) {
          await this.carDriverAssignmentsService.lockCustodyRowsInTx(
            tx,
            id,
            dto.driverId,
          );
        }

        const existing = await this.carsReader.getById(tx, id);
        this._assertCarActive(existing);

        const nextCompanyId =
          dto.companyId !== undefined ? dto.companyId : existing.companyId;
        const nextDriverId =
          dto.driverId !== undefined ? dto.driverId : existing.driverId;

        if (nextDriverId) {
          await this._assertDriverAssignableToCompany(
            tx,
            nextDriverId,
            nextCompanyId,
          );
        }

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
            ...(dto.companyId !== undefined
              ? { companyId: dto.companyId }
              : {}),
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
    } catch (error) {
      rethrowPostgresError(error, CAR_POSTGRES_MAPPINGS);
    }
  }

  /** Soft-delete: mark inactive, end custody, keep row for assignment history. */
  async delete(context: ApiTenantContext, id: string): Promise<null> {
    return this.tenantDb.run(context, async (tx) => {
      const existing = await this.carsReader.getById(tx, id);

      if (existing.status === ENTITY_STATUS.INACTIVE) {
        return null;
      }

      await this.carDriverAssignmentsService.closeOpenAssignmentsForCarInTx(
        tx,
        id,
      );

      const [row] = await tx
        .update(cars)
        .set({
          status: ENTITY_STATUS.INACTIVE,
          driverId: null,
        })
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

      return null;
    });
  }

  private _assertCarActive(car: Car): void {
    if (car.status !== ENTITY_STATUS.ACTIVE) {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        'Validation failed',
        [{ field: 'id', message: 'Car is inactive' }],
      );
    }
  }

  /**
   * Driver must share companyId and be active. RLS hides other-company drivers
   * for company users; internal admins see all drivers, so this check is required.
   */
  private async _assertDriverAssignableToCompany(
    tx: TenantTransaction,
    driverId: string,
    companyId: string,
  ): Promise<void> {
    const [driver] = await tx
      .select({
        id: drivers.id,
        companyId: drivers.companyId,
        status: drivers.status,
      })
      .from(drivers)
      .where(eq(drivers.id, driverId))
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

    if (driver.status !== ENTITY_STATUS.ACTIVE) {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        'Validation failed',
        [{ field: 'driverId', message: 'Driver is inactive' }],
      );
    }
  }
}

function _mapCar(row: typeof cars.$inferSelect): Car {
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

const CAR_AUDIT_FIELDS = [
  'name',
  'licensePlate',
  'driverId',
  'note',
  'status',
] as const satisfies readonly (keyof Car)[];
