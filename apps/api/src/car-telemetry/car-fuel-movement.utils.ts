import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types/api-error-code';
import type { CarFuelMovement } from '@fuel-carrier/shared-types/car-fuel-movement';
import type { PaginatedResult } from '@fuel-carrier/shared-types/pagination';
import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import { createApiException } from '../common/exceptions/api.exception';
import { toIsoTimestamp } from '../common/iso-timestamp.utils';
import {
  getPaginationOffset,
  toPaginatedResult,
} from '../common/pagination.utils';
import { cars } from '../database/schema/cars.schema';
import {
  carFuelMovements,
  carFuelTransactionCursors,
} from '../database/schema/car-fuel-movement.schema';
import type { CarTelemetryMode } from '../database/schema/car-telemetry-history.schema';
import type { TenantTransaction } from '../database/tenant-db.types';

const POSTGRES_INT4_MAX = 2_147_483_647;

type FuelMovementAction = 'skip' | 'reset' | 'advance' | 'record';

export type CaptureCarFuelMovementInput = {
  carId: string;
  companyId: string;
  recordedAt: Date;
  mode: CarTelemetryMode;
  liters?: number;
  pricePerLiter?: number;
  wage?: number;
  transactionId?: number;
};

type ListCarFuelMovementsInput = {
  companyId?: string;
  carId: string;
  start?: Date;
  end?: Date;
  page: number;
  limit: number;
};

/**
 * Remember the latest transaction id. A higher id in loading or dispensing
 * stores one fuel movement. Idle and a drop to zero only move the cursor.
 */
export async function captureCarFuelMovement(
  tx: TenantTransaction,
  input: CaptureCarFuelMovementInput,
): Promise<void> {
  const transactionId = toTrackedTransactionId(input.transactionId);
  if (transactionId == null) {
    return;
  }

  const seeded = await tx
    .insert(carFuelTransactionCursors)
    .values({
      carId: input.carId,
      companyId: input.companyId,
      lastTransactionId: transactionId,
    })
    .onConflictDoNothing()
    .returning({ carId: carFuelTransactionCursors.carId });

  if (seeded.length > 0) {
    return;
  }

  const [cursor] = await tx
    .select({
      lastTransactionId: carFuelTransactionCursors.lastTransactionId,
    })
    .from(carFuelTransactionCursors)
    .where(eq(carFuelTransactionCursors.carId, input.carId))
    .limit(1)
    .for('update');

  if (!cursor) {
    return;
  }

  const action = decideFuelMovement({
    previousTransactionId: cursor.lastTransactionId,
    transactionId,
    mode: input.mode,
  });

  if (action === 'skip') {
    return;
  }

  if (action === 'record') {
    await tx.insert(carFuelMovements).values({
      carId: input.carId,
      companyId: input.companyId,
      recordedAt: input.recordedAt,
      mode: input.mode,
      liters: input.liters ?? null,
      pricePerLiter: input.pricePerLiter ?? null,
      wage: input.wage ?? null,
      transactionId,
    });
  }

  await tx
    .update(carFuelTransactionCursors)
    .set({
      lastTransactionId: transactionId,
      updatedAt: new Date(),
    })
    .where(eq(carFuelTransactionCursors.carId, input.carId));
}

export async function listCarFuelMovements(
  tx: TenantTransaction,
  input: ListCarFuelMovementsInput,
): Promise<PaginatedResult<CarFuelMovement>> {
  const car = await tx.query.cars.findFirst({
    where: eq(cars.id, input.carId),
    columns: {
      id: true,
      companyId: true,
    },
  });

  if (!car || (input.companyId != null && car.companyId !== input.companyId)) {
    throw createApiException(
      HttpStatus.NOT_FOUND,
      ApiErrorCode.NOT_FOUND,
      'Car not found',
    );
  }

  const where = and(
    eq(carFuelMovements.carId, input.carId),
    input.start ? gte(carFuelMovements.recordedAt, input.start) : undefined,
    input.end ? lte(carFuelMovements.recordedAt, input.end) : undefined,
  );

  const [countRow] = await tx
    .select({ value: count() })
    .from(carFuelMovements)
    .where(where);

  const totalItems = Number(countRow?.value ?? 0);
  const rows = await tx
    .select({
      id: carFuelMovements.id,
      carId: carFuelMovements.carId,
      recordedAt: carFuelMovements.recordedAt,
      mode: carFuelMovements.mode,
      liters: carFuelMovements.liters,
      pricePerLiter: carFuelMovements.pricePerLiter,
      wage: carFuelMovements.wage,
      transactionId: carFuelMovements.transactionId,
    })
    .from(carFuelMovements)
    .where(where)
    .orderBy(desc(carFuelMovements.recordedAt), desc(carFuelMovements.id))
    .limit(input.limit)
    .offset(getPaginationOffset(input));

  return toPaginatedResult({
    items: rows.map(toCarFuelMovement),
    page: input.page,
    limit: input.limit,
    totalItems,
  });
}

/**
 * Compare this sample's transaction id with the previous one.
 * A higher id records a movement only while loading or dispensing.
 * Idle and a drop to zero only move the cursor.
 */
export function decideFuelMovement(options: {
  previousTransactionId: number;
  transactionId: number;
  mode: CarTelemetryMode;
}): FuelMovementAction {
  if (options.transactionId > options.previousTransactionId) {
    return options.mode === 'idle' ? 'advance' : 'record';
  }

  if (options.transactionId < options.previousTransactionId) {
    return 'reset';
  }

  return 'skip';
}

/** Whole transaction ids that fit in the cursor column. `0` is the power-off reset. */
export const toTrackedTransactionId = (
  value: number | undefined,
): number | null =>
  value != null &&
  Number.isSafeInteger(value) &&
  value >= 0 &&
  value <= POSTGRES_INT4_MAX
    ? value
    : null;

const toCarFuelMovement = (row: {
  id: string;
  carId: string;
  recordedAt: Date | string;
  mode: CarTelemetryMode;
  liters: number | null;
  pricePerLiter: number | null;
  wage: number | null;
  transactionId: number;
}): CarFuelMovement => ({
  id: row.id,
  carId: row.carId,
  recordedAt: toIsoTimestamp(row.recordedAt),
  mode: row.mode,
  liters: row.liters ?? undefined,
  pricePerLiter: row.pricePerLiter ?? undefined,
  wage: row.wage ?? undefined,
  transactionId: row.transactionId,
});
