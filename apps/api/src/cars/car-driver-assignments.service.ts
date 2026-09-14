import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, isNull, or } from 'drizzle-orm';
import type {
  CarDriverAssignment,
  PaginatedResult,
  PaginationParams,
  TenantContext,
} from '@fuel-carrier/shared-types';
import type { ApiTenantContext } from '../database/tenant-context.types';
import { getTenantContextActor } from '../database/tenant-context.utils';
import { carDriverAssignments } from '../database/schema/car-driver-assignments';
import { cars } from '../database/schema/cars';
import { drivers } from '../database/schema/drivers';
import { users } from '../database/schema/users';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';
import {
  toIsoTimestamp,
  toIsoTimestampOrNull,
} from '../common/iso-timestamp.utils';
import { CarsReader } from './cars-reader.service';

@Injectable()
export class CarDriverAssignmentsService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly carsReader: CarsReader,
  ) {}

  async listByCar(
    context: TenantContext,
    carId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<CarDriverAssignment>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    return this.tenantDb.run(context, async (tx) => {
      await this.carsReader.getById(tx, carId);

      const where = eq(carDriverAssignments.carId, carId);

      const [countRow] = await tx
        .select({ value: count() })
        .from(carDriverAssignments)
        .where(where);

      const totalItems = countRow?.value ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));

      const rows = await tx
        .select({
          id: carDriverAssignments.id,
          carId: carDriverAssignments.carId,
          driverId: carDriverAssignments.driverId,
          companyId: carDriverAssignments.companyId,
          assignedAt: carDriverAssignments.assignedAt,
          unassignedAt: carDriverAssignments.unassignedAt,
          assignedByUserId: carDriverAssignments.assignedByUserId,
          driverFirstName: drivers.firstName,
          driverLastName: drivers.lastName,
          assignedByFirstName: users.firstName,
          assignedByLastName: users.lastName,
        })
        .from(carDriverAssignments)
        .leftJoin(drivers, eq(carDriverAssignments.driverId, drivers.id))
        .leftJoin(users, eq(carDriverAssignments.assignedByUserId, users.id))
        .where(where)
        .orderBy(desc(carDriverAssignments.assignedAt))
        .limit(limit)
        .offset(offset);

      return {
        items: rows.map(_mapAssignment),
        page,
        limit,
        totalItems,
        totalPages,
      };
    });
  }

  async syncDriverChangeInTx(
    tx: TenantTransaction,
    context: ApiTenantContext,
    input: SyncDriverChangeInput,
  ): Promise<void> {
    if (input.previousDriverId === input.nextDriverId) {
      return;
    }

    await this.lockCustodyRowsInTx(tx, input.carId, input.nextDriverId);

    const [lockedCar] = await tx
      .select({ driverId: cars.driverId })
      .from(cars)
      .where(eq(cars.id, input.carId))
      .limit(1);

    if (!lockedCar || lockedCar.driverId === input.nextDriverId) {
      return;
    }

    /** One instant for close+open so abutting ranges do not overlap. */
    const at = new Date();

    if (input.nextDriverId) {
      await this.releaseDriverFromOtherCarInTx(tx, {
        driverId: input.nextDriverId,
        exceptCarId: input.carId,
        alreadyLocked: true,
        at,
      });
    }

    await this.closeOpenAssignmentsForCarInTx(tx, input.carId, at);

    if (!input.nextDriverId) {
      return;
    }

    await this.insertOpenAssignmentInTx(tx, context, {
      carId: input.carId,
      driverId: input.nextDriverId,
      companyId: input.companyId,
      assignedAt: at,
    });
  }

  async openAssignmentInTx(
    tx: TenantTransaction,
    context: ApiTenantContext,
    input: OpenAssignmentInput,
  ): Promise<void> {
    const at = new Date();

    await this.lockCustodyRowsInTx(tx, input.carId, input.driverId);
    await this.releaseDriverFromOtherCarInTx(tx, {
      driverId: input.driverId,
      exceptCarId: input.carId,
      alreadyLocked: true,
      at,
    });
    await this.closeOpenAssignmentsForCarInTx(tx, input.carId, at);
    await this.insertOpenAssignmentInTx(tx, context, {
      ...input,
      assignedAt: at,
    });
  }

  async closeOpenAssignmentsForDriverInTx(
    tx: TenantTransaction,
    driverId: string,
    at: Date = new Date(),
  ): Promise<void> {
    await tx
      .update(carDriverAssignments)
      .set({ unassignedAt: at })
      .where(
        and(
          eq(carDriverAssignments.driverId, driverId),
          isNull(carDriverAssignments.unassignedAt),
        ),
      );
  }

  async insertOpenAssignmentInTx(
    tx: TenantTransaction,
    context: ApiTenantContext,
    input: OpenAssignmentInput,
  ): Promise<void> {
    const actor = getTenantContextActor(context);

    await tx.insert(carDriverAssignments).values({
      carId: input.carId,
      driverId: input.driverId,
      companyId: input.companyId,
      assignedAt: input.assignedAt ?? new Date(),
      assignedByUserId: actor?.userId ?? null,
    });
  }

  async closeOpenAssignmentsForCarInTx(
    tx: TenantTransaction,
    carId: string,
    at: Date = new Date(),
  ): Promise<void> {
    await tx
      .update(carDriverAssignments)
      .set({ unassignedAt: at })
      .where(
        and(
          eq(carDriverAssignments.carId, carId),
          isNull(carDriverAssignments.unassignedAt),
        ),
      );
  }

  async releaseDriverFromOtherCarInTx(
    tx: TenantTransaction,
    input: ReleaseDriverFromOtherCarInput,
  ): Promise<void> {
    const { driverId, exceptCarId, alreadyLocked = false, at = new Date() } =
      input;

    if (!alreadyLocked) {
      await this.lockCustodyRowsInTx(tx, exceptCarId, driverId);
    }

    const [otherCar] = await tx
      .select({ id: cars.id })
      .from(cars)
      .where(eq(cars.driverId, driverId))
      .limit(1);

    if (!otherCar || otherCar.id === exceptCarId) {
      return;
    }

    await this.closeOpenAssignmentsForCarInTx(tx, otherCar.id, at);
    await tx
      .update(cars)
      .set({ driverId: null })
      .where(eq(cars.id, otherCar.id));
  }

  /**
   * Serialize custody writes with Drizzle row locks.
   * Lock the driver first (when assigning), then involved cars by id order.
   */
  async lockCustodyRowsInTx(
    tx: TenantTransaction,
    carId: string | null,
    driverId: string | null,
  ): Promise<void> {
    if (driverId) {
      await tx
        .select({ id: drivers.id })
        .from(drivers)
        .where(eq(drivers.id, driverId))
        .for('update')
        .limit(1);
    }

    if (carId && driverId) {
      await tx
        .select({ id: cars.id })
        .from(cars)
        .where(or(eq(cars.id, carId), eq(cars.driverId, driverId)))
        .orderBy(asc(cars.id))
        .for('update');
      return;
    }

    if (carId) {
      await tx
        .select({ id: cars.id })
        .from(cars)
        .where(eq(cars.id, carId))
        .for('update')
        .limit(1);
      return;
    }

    if (driverId) {
      await tx
        .select({ id: cars.id })
        .from(cars)
        .where(eq(cars.driverId, driverId))
        .orderBy(asc(cars.id))
        .for('update');
    }
  }
}

function _mapAssignment(row: {
  id: string;
  carId: string | null;
  driverId: string | null;
  companyId: string | null;
  assignedAt: Date;
  unassignedAt: Date | null;
  assignedByUserId: string | null;
  driverFirstName: string | null;
  driverLastName: string | null;
  assignedByFirstName: string | null;
  assignedByLastName: string | null;
}): CarDriverAssignment {
  return {
    id: row.id,
    carId: row.carId,
    driverId: row.driverId,
    companyId: row.companyId,
    assignedAt: toIsoTimestamp(row.assignedAt),
    unassignedAt: toIsoTimestampOrNull(row.unassignedAt),
    assignedByUserId: row.assignedByUserId,
    driver:
      row.driverFirstName && row.driverLastName
        ? {
            firstName: row.driverFirstName,
            lastName: row.driverLastName,
          }
        : null,
    assignedBy:
      row.assignedByFirstName && row.assignedByLastName
        ? {
            firstName: row.assignedByFirstName,
            lastName: row.assignedByLastName,
          }
        : null,
  };
}

type OpenAssignmentInput = {
  carId: string;
  driverId: string;
  companyId: string;
  /** When closing prior custody in the same transfer, pass the same instant. */
  assignedAt?: Date;
};

type SyncDriverChangeInput = {
  carId: string;
  companyId: string;
  previousDriverId: string | null;
  nextDriverId: string | null;
};

type ReleaseDriverFromOtherCarInput = {
  driverId: string;
  exceptCarId: string | null;
  alreadyLocked?: boolean;
  /** Shared instant when a new open assignment follows this release. */
  at?: Date;
};
