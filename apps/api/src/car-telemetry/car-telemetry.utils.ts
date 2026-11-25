import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types/api-error-code';
import type {
  CarTelemetry,
  CarTelemetryMarker,
  TankResistanceReadings,
} from '@fuel-carrier/shared-types/car-telemetry';
import { and, asc, eq, gte, isNull, lte } from 'drizzle-orm';
import { createApiException } from '../common/exceptions/api.exception';
import { toIsoTimestamp } from '../common/iso-timestamp.utils';
import { cars } from '../database/schema/cars.schema';
import {
  carTelemetryHistory,
  type CarTelemetryMode,
} from '../database/schema/car-telemetry-history.schema';
import type { TenantTransaction } from '../database/tenant-db.types';
import { captureCarFuelMovement } from './car-fuel-movement.utils';

type RemovedTelemetryCar = {
  companyId: string;
  carId: string;
};

/** History writes, history reads, and live-fleet marker assembly for {@link CarTelemetryService}. */
export class CarTelemetryUtils {
  /**
   * Insert or replace one history row and return the car identity needed for the live marker.
   * Devices may resend the same sample timestamp, so the primary key is upserted.
   */
  static async persistSample(
    tx: TenantTransaction,
    options: PersistCarTelemetryOptions,
  ): Promise<RecordedCarIdentity> {
    const { input } = options;
    const car = await tx.query.cars.findFirst({
      where: and(eq(cars.id, input.carId), isNull(cars.deletedAt)),
      with: { company: true },
    });

    if (!car) {
      throw createApiException(
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
        'Car not found',
      );
    }

    if (car.companyId !== input.companyId) {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        'Car does not belong to the given company',
      );
    }

    const written = CarTelemetryUtils.toTelemetryWrite(options);
    await tx
      .insert(carTelemetryHistory)
      .values({
        time: options.recordedAt,
        carId: input.carId,
        ...written,
      })
      .onConflictDoUpdate({
        target: [carTelemetryHistory.time, carTelemetryHistory.carId],
        set: written,
      });

    await captureCarFuelMovement(tx, {
      carId: input.carId,
      companyId: input.companyId,
      recordedAt: options.recordedAt,
      mode: options.mode,
      liters: input.fuelAmount,
      pricePerLiter: input.pricePerLiter,
      wage: input.wage,
      transactionId: input.transactionId,
    });

    return {
      licensePlate: car.licensePlate,
      hasHighGrade: car.hasHighGrade,
      tankCount: car.tankCount,
      tankCapacityLiters: car.tankCapacityLiters,
      companyName: car.company?.name ?? '',
    };
  }

  static toRecordedTelemetry(
    options: PersistCarTelemetryOptions,
  ): CarTelemetry {
    const { input } = options;
    const telemetry: CarTelemetry = {
      carId: input.carId,
      latitude: input.latitude,
      longitude: input.longitude,
      updatedAt: options.recordedAt.toISOString(),
      createdAt: options.ingestedAt.toISOString(),
      speed: input.speed,
      remainFuel: input.remainFuel,
      mode: options.mode,
    };

    if (input.resistance != null) {
      telemetry.resistance = input.resistance;
    }

    return telemetry;
  }

  /** Historical samples for one car, scoped to the caller's company when set. */
  static async loadHistory(
    tx: TenantTransaction,
    options: LoadCarTelemetryHistoryOptions,
  ): Promise<CarTelemetry[]> {
    const car = await tx.query.cars.findFirst({
      where: eq(cars.id, options.carId),
      columns: {
        id: true,
        companyId: true,
      },
    });

    if (!car) {
      throw createApiException(
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
        'Car not found',
      );
    }

    if (options.companyId && car.companyId !== options.companyId) {
      throw createApiException(
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
        'Car not found',
      );
    }

    const rows = await tx
      .select({
        carId: carTelemetryHistory.carId,
        latitude: carTelemetryHistory.latitude,
        longitude: carTelemetryHistory.longitude,
        updatedAt: carTelemetryHistory.time,
        speed: carTelemetryHistory.speed,
        remainFuel: carTelemetryHistory.remainFuel,
        mode: carTelemetryHistory.mode,
        resistanceTankToGround: carTelemetryHistory.resistanceTankToGround,
        resistanceTankToNozzle: carTelemetryHistory.resistanceTankToNozzle,
        resistanceGroundToVehicle:
          carTelemetryHistory.resistanceGroundToVehicle,
      })
      .from(carTelemetryHistory)
      .where(
        and(
          eq(carTelemetryHistory.carId, options.carId),
          options.start
            ? gte(carTelemetryHistory.time, options.start)
            : undefined,
          options.end ? lte(carTelemetryHistory.time, options.end) : undefined,
        ),
      )
      .orderBy(asc(carTelemetryHistory.time));

    return CarTelemetryUtils.toHistorySelectRows(rows).map((row) =>
      CarTelemetryUtils.toHistoryPoint(row),
    );
  }

  /** Live fleet used by dashboard counts. Soft-deleted cars stay out of the map. */
  static async listLiveFleetCars(tx: TenantTransaction): Promise<FleetCar[]> {
    return tx.query.cars.findMany({
      where: isNull(cars.deletedAt),
      columns: {
        id: true,
        licensePlate: true,
        companyId: true,
        hasHighGrade: true,
        tankCount: true,
        tankCapacityLiters: true,
      },
      with: {
        company: {
          columns: {
            name: true,
          },
        },
      },
    });
  }

  static toMarkers(
    fleet: FleetCar[],
    telemetryByCompany: ReadonlyMap<string, CarTelemetry[]>,
  ): CarTelemetryMarker[] {
    const carsById = new Map(fleet.map((car) => [car.id, car] as const));
    const markers: CarTelemetryMarker[] = [];

    for (const companyTelemetry of telemetryByCompany.values()) {
      for (const telemetry of companyTelemetry) {
        const car = carsById.get(telemetry.carId);
        if (!car) {
          continue;
        }

        markers.push({
          ...telemetry,
          licensePlate: car.licensePlate,
          companyId: car.companyId,
          companyName: car.company?.name ?? '',
          hasHighGrade: car.hasHighGrade,
          tankCount: car.tankCount,
          tankCapacityLiters: car.tankCapacityLiters,
        });
      }
    }

    return markers;
  }

  /**
   * Redis can still hold a sample after the car is soft-deleted.
   * Those keys have to be removed so the open map drops the marker.
   */
  static listRemovedCars(options: {
    fleet: FleetCar[];
    telemetryByCompany: ReadonlyMap<string, CarTelemetry[]>;
  }): RemovedTelemetryCar[] {
    const liveCarIds = new Set(options.fleet.map((car) => car.id));
    const removed: RemovedTelemetryCar[] = [];

    for (const [companyId, samples] of options.telemetryByCompany) {
      for (const sample of samples) {
        if (liveCarIds.has(sample.carId)) {
          continue;
        }

        removed.push({ companyId, carId: sample.carId });
      }
    }

    return removed;
  }

  private static toTelemetryWrite(options: PersistCarTelemetryOptions) {
    return {
      companyId: options.input.companyId,
      latitude: options.input.latitude,
      longitude: options.input.longitude,
      speed: options.input.speed,
      remainFuel: options.input.remainFuel,
      mode: options.mode,
      resistanceTankToGround: options.input.resistance?.tankToGround,
      resistanceTankToNozzle: options.input.resistance?.tankToNozzle,
      resistanceGroundToVehicle: options.input.resistance?.groundToVehicle,
      createdAt: options.ingestedAt,
    };
  }

  private static toHistorySelectRows(rows: unknown): HistorySelectRow[] {
    return rows as HistorySelectRow[];
  }

  private static toHistoryPoint(row: HistorySelectRow): CarTelemetry {
    return {
      carId: row.carId,
      latitude: row.latitude,
      longitude: row.longitude,
      updatedAt: toIsoTimestamp(row.updatedAt),
      speed: row.speed ?? undefined,
      remainFuel: row.remainFuel ?? undefined,
      mode: row.mode,
      resistance: CarTelemetryUtils.toHistoryResistance(row),
    };
  }

  private static toHistoryResistance(
    row: HistorySelectRow,
  ): TankResistanceReadings | undefined {
    if (
      row.resistanceTankToGround == null ||
      row.resistanceTankToNozzle == null ||
      row.resistanceGroundToVehicle == null
    ) {
      return undefined;
    }

    return {
      tankToGround: row.resistanceTankToGround,
      tankToNozzle: row.resistanceTankToNozzle,
      groundToVehicle: row.resistanceGroundToVehicle,
    };
  }
}

export type RecordCarTelemetryInput = {
  carId: string;
  companyId: string;
  latitude: number;
  longitude: number;
  recordedAt?: Date;
  speed?: number;
  remainFuel?: number;
  /** Liters on this sample. Stored on a fuel movement when the transaction id increases. */
  fuelAmount?: number;
  /** Price per liter on this sample. Stored on a fuel movement with the liters. */
  pricePerLiter?: number;
  /** Wage on this sample. Stored on a fuel movement with the liters. */
  wage?: number;
  mode?: CarTelemetryMode;
  resistance?: TankResistanceReadings;
  /** Device transaction id. An increase samples one fuel movement. */
  transactionId?: number;
};

type PersistCarTelemetryOptions = {
  input: RecordCarTelemetryInput;
  recordedAt: Date;
  ingestedAt: Date;
  mode: CarTelemetryMode;
};

export type RecordedCarIdentity = {
  licensePlate: string;
  hasHighGrade: boolean;
  tankCount: number;
  tankCapacityLiters: number;
  companyName: string;
};

type LoadCarTelemetryHistoryOptions = {
  companyId?: string;
  carId: string;
  start?: Date;
  end?: Date;
};

type HistorySelectRow = {
  carId: string;
  latitude: number;
  longitude: number;
  updatedAt: Date | string;
  speed: number | null;
  remainFuel: number | null;
  mode: CarTelemetryMode;
  resistanceTankToGround: number | null;
  resistanceTankToNozzle: number | null;
  resistanceGroundToVehicle: number | null;
};

export type FleetCar = {
  id: string;
  licensePlate: string;
  companyId: string;
  hasHighGrade: boolean;
  tankCount: number;
  tankCapacityLiters: number;
  company: {
    name: string;
  } | null;
};
