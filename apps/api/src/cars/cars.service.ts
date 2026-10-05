import { HttpStatus, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import type {
  Car,
  CarFleetStats,
  PaginatedResult,
} from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditActions,
  AuditEntityType,
} from '@fuel-carrier/shared-types';
import { computeCarFleetStats } from '@fuel-carrier/shared-types/car-fleet-stats';
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
import { CarTelemetryService } from '../car-telemetry/car-telemetry.service';
import { cars } from '../database/schema/cars';
import { mqttClients } from '../database/schema/mqtt-clients';
import { rethrowPostgresError } from '../database/postgres-error.utils';
import { TenantDbService } from '../database/tenant-db.service';
import type { ApiTenantContext } from '../database/tenant-context.types';
import { CarDriverAssignmentsService } from './car-driver-assignments.service';
import { applyCarFuelLevelFilter } from './apply-car-fuel-level-filter';
import { assertDriverAssignableToCompany } from './assert-driver-assignable';
import {
  buildCarFuelGradeFilter,
  buildCarSearchFilter,
} from './cars-list-filters';
import { CAR_POSTGRES_MAPPINGS } from './cars-postgres-mappings';
import { CarsReader, mapCarRow } from './cars-reader.service';
import {
  CAR_AUDIT_FIELDS,
  type CreateCarPayload,
  type ListCarsOptions,
  type UpdateCarPayload,
} from './cars.types';
import { assertCustodyPrecondition } from './custody-conflict';

const EMPTY_FLEET_STATS: CarFleetStats = {
  totalCars: 0,
  fuelHigh: 0,
  fuelMidHigh: 0,
  fuelMidLow: 0,
  fuelLow: 0,
  highGrade: 0,
};

@Injectable()
export class CarsService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditLogService: AuditLogService,
    private readonly carsReader: CarsReader,
    private readonly carDriverAssignmentsService: CarDriverAssignmentsService,
    private readonly carTelemetryService: CarTelemetryService,
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
      fuelGrade,
      fuelLevel = 'all',
    } = listOptions;
    if (companyId) {
      assertUuidParam(companyId, 'companyId');
    }

    const offset = getPaginationOffset(listOptions);
    const baseWhere = and(
      isNull(cars.deletedAt),
      companyId ? eq(cars.companyId, companyId) : undefined,
      buildCarSearchFilter(searchText),
      buildCarFuelGradeFilter(fuelGrade),
    );

    return this.tenantDb.run(context, async (tx) => {
      const where = await applyCarFuelLevelFilter({
        tx,
        baseWhere,
        companyId: companyId ?? context.companyId ?? null,
        fuelLevel,
        getRemainFuelByCarId: (scopedCompanyId) =>
          this.carTelemetryService.getRemainFuelByCarId(scopedCompanyId),
      });

      if (where === null) {
        return toPaginatedResult({ items: [], page, limit, totalItems: 0 });
      }

      const [countRow] = await tx
        .select({ value: count() })
        .from(cars)
        .where(where);

      const rows = await tx.query.cars.findMany({
        where,
        with: { driver: true },
        orderBy: desc(cars.createdAt),
        limit,
        offset,
      });

      return toPaginatedResult({
        items: rows.map(function toCar(row) {
          return mapCarRow(row, row.driver);
        }),
        page,
        limit,
        totalItems: countRow?.value ?? 0,
      });
    });
  }

  /**
   * Fleet KPI counts for the company: totals, fuel bands (from live remainFuel),
   * and high-grade petrol cars.
   * Internal callers pass `companyId`; external callers rely on session tenant.
   */
  async getFleetStats(
    context: ApiTenantContext,
    companyId?: string,
  ): Promise<CarFleetStats> {
    const scopedCompanyId = companyId ?? context.companyId;
    if (!scopedCompanyId) {
      return EMPTY_FLEET_STATS;
    }

    if (companyId) {
      assertUuidParam(companyId, 'companyId');
    }

    const [fleetCars, remainFuelByCarId] = await Promise.all([
      this.tenantDb.run(context, async (tx) => {
        return tx
          .select({ id: cars.id, hasHighGrade: cars.hasHighGrade })
          .from(cars)
          .where(
            and(isNull(cars.deletedAt), eq(cars.companyId, scopedCompanyId)),
          );
      }),
      this.carTelemetryService.getRemainFuelByCarId(scopedCompanyId),
    ]);

    return computeCarFleetStats(fleetCars, remainFuelByCarId);
  }

  async getById(context: ApiTenantContext, id: string): Promise<Car> {
    return this.tenantDb.run(context, (tx) => this.carsReader.getById(tx, id));
  }

  async create(context: ApiTenantContext, dto: CreateCarPayload): Promise<Car> {
    try {
      return await this.tenantDb.run(context, async (tx) => {
        const custodyAt = new Date();

        await assertDriverAssignableToCompany(tx, dto.driverId, dto.companyId);
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
            hasHighGrade: dto.hasHighGrade ?? false,
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

        const car = await this.carsReader.getById(tx, row.id);
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

        const nextCompanyId = dto.companyId ?? existing.companyId;
        const nextDriverId =
          dto.driverId !== undefined ? dto.driverId : existing.driverId;

        if (nextDriverId) {
          await assertDriverAssignableToCompany(
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
            ...(dto.hasHighGrade !== undefined
              ? { hasHighGrade: dto.hasHighGrade }
              : {}),
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

        const car = await this.carsReader.getById(tx, row.id);
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
        .set({ deletedAt, driverId: null })
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
}
