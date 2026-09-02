import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
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
import { CarsReader } from './cars-reader.service';

type OpenAssignmentInput = {
  carId: string;
  driverId: string;
  companyId: string;
};

type SyncDriverChangeInput = {
  carId: string;
  companyId: string;
  previousDriverId: string | null;
  nextDriverId: string | null;
};

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

    if (input.nextDriverId) {
      await this.releaseDriverFromOtherCarInTx(
        tx,
        input.nextDriverId,
        input.carId,
      );
    }

    await this.closeOpenAssignmentsForCarInTx(tx, input.carId);

    if (!input.nextDriverId) {
      return;
    }

    await this.insertOpenAssignmentInTx(tx, context, {
      carId: input.carId,
      driverId: input.nextDriverId,
      companyId: input.companyId,
    });
  }

  async openAssignmentInTx(
    tx: TenantTransaction,
    context: ApiTenantContext,
    input: OpenAssignmentInput,
  ): Promise<void> {
    await this.releaseDriverFromOtherCarInTx(tx, input.driverId, input.carId);
    await this.closeOpenAssignmentsForCarInTx(tx, input.carId);
    await this.insertOpenAssignmentInTx(tx, context, input);
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
    driverId: string,
    exceptCarId: string | null,
  ): Promise<void> {
    const [otherCar] = await tx
      .select({ id: cars.id })
      .from(cars)
      .where(eq(cars.driverId, driverId))
      .limit(1);

    if (!otherCar || otherCar.id === exceptCarId) {
      return;
    }

    await this.closeOpenAssignmentsForCarInTx(tx, otherCar.id);
    await tx
      .update(cars)
      .set({ driverId: null })
      .where(eq(cars.id, otherCar.id));
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
    assignedAt: row.assignedAt,
    unassignedAt: row.unassignedAt,
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
