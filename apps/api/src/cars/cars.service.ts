import { HttpStatus, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import type { Car, PaginatedResult } from '@fuel-carrier/shared-types';
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
import { assertUuidParam } from '../common/validation/uuid.utils';
import { cars } from '../database/schema/cars';
import { drivers } from '../database/schema/drivers';
import { mqttClients } from '../database/schema/mqtt-clients';
import { rethrowPostgresError } from '../database/postgres-error.utils';
import { TenantDbService } from '../database/tenant-db.service';
import type { ApiTenantContext } from '../database/tenant-context.types';
import type { TenantTransaction } from '../database/tenant-db.types';
import { CarDriverAssignmentsService } from './car-driver-assignments.service';
import {
  buildCarAssignmentFilter,
  buildCarSearchFilter,
} from './cars-list-filters';
import { CAR_POSTGRES_MAPPINGS } from './cars-postgres-mappings';
import { CarsReader, mapCarRow } from './cars-reader.service';
import { assertCustodyPrecondition } from './custody-conflict';

type CreateCarPayload = {
  name?: string | null;
  licensePlate: string;
  companyId: string;
  driverId: string;
  note?: string | null;
};

type UpdateCarPayload = Partial<Omit<CreateCarPayload, 'driverId'>> & {
  driverId?: string;
  expectedDriverId?: string | null;
};

type ListCarsOptions = {
  page: number;
  limit: number;
  search?: string;
  assignment?: 'all' | 'assigned' | 'unassigned';
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
    listOptions: ListCarsOptions,
  ): Promise<PaginatedResult<Car>> {
    const {
      page,
      limit,
      companyId,
      search: searchText,
      assignment,
    } = listOptions;
    if (companyId) {
      assertUuidParam(companyId, 'companyId');
    }

    const offset = getPaginationOffset(listOptions);
    const where = and(
      isNull(cars.deletedAt),
      companyId ? eq(cars.companyId, companyId) : undefined,
      buildCarSearchFilter(searchText),
      buildCarAssignmentFilter(assignment),
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
        items: rows.map(mapCarRow),
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
        const custodyAt = new Date();

        await this._assertDriverAssignableToCompany(
          tx,
          dto.driverId,
          dto.companyId,
        );
        await this.carDriverAssignmentsService.assertDriverFreeOrThrowInTx(tx, {
          driverId: dto.driverId,
          exceptCarId: null,
        });

        const [row] = await tx
          .insert(cars)
          .values({
            name: dto.name ?? null,
            licensePlate: dto.licensePlate,
            companyId: dto.companyId,
            driverId: dto.driverId,
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

        await this.carDriverAssignmentsService.insertOpenAssignmentInTx(
          tx,
          context,
          {
            carId: row.id,
            driverId: dto.driverId,
            companyId: row.companyId,
            assignedAt: custodyAt,
          },
        );

        const car = mapCarRow(row);
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

        if (dto.driverId !== undefined) {
          assertCustodyPrecondition({
            currentDriverId: existing.driverId,
            expectedDriverId: dto.expectedDriverId,
          });
        }

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
          .where(and(eq(cars.id, id), isNull(cars.deletedAt)))
          .returning();

        if (!row) {
          throw createApiException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NOT_FOUND,
            'Car not found',
          );
        }

        const car = mapCarRow(row);
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

  /** Soft-delete: set deletedAt, end custody, disable MQTT, keep row for history. */
  async delete(context: ApiTenantContext, id: string): Promise<null> {
    return this.tenantDb.run(context, async (tx) => {
      const existing = await this.carsReader.getByIdIncludingDeleted(tx, id);

      if (existing.deletedAt) {
        return null;
      }

      const deletedAt = new Date();

      await this.carDriverAssignmentsService.closeOpenAssignmentsForCarInTx(
        tx,
        id,
        deletedAt,
      );

      await tx
        .update(mqttClients)
        .set({ enabled: false })
        .where(eq(mqttClients.carId, id));

      const [row] = await tx
        .update(cars)
        .set({
          deletedAt,
          driverId: null,
        })
        .where(and(eq(cars.id, id), isNull(cars.deletedAt)))
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

  /**
   * Driver must share companyId and be live. RLS hides other-company drivers
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
}

const CAR_AUDIT_FIELDS = [
  'name',
  'licensePlate',
  'driverId',
  'note',
] as const satisfies readonly (keyof Car)[];
