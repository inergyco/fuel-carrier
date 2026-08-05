import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types/api-error-code';
import type { TenantContext } from '@fuel-carrier/shared-types/tenant-context';
import Redis from 'ioredis';
import { CarsReader } from '../cars/cars-reader.service';
import {
  ApiException,
  createApiException,
} from '../common/exceptions/api.exception';
import { cars } from '../database/schema/cars';
import { carTelemetryHistory } from '../database/schema/car-telemetry-history';
import { internalTenantContext } from '../database/tenant-context.utils';
import { TenantDbService } from '../database/tenant-db.service';
import { REDIS } from '../redis/redis.tokens';
import { CarTelemetryRealtimeService } from './car-telemetry-realtime.service';
import {
  companyCarTelemetryKey,
  parseCarTelemetry,
  serializeCarTelemetry,
} from './car-telemetry.redis';
import {
  CarTelemetrySocketEvents,
  type CarTelemetry,
  type CarTelemetryMarker,
} from './car-telemetry.types';

type ResistanceReadings = {
  tankToGround: number;
  tankToNozzle: number;
  groundToVehicle: number;
};

type RecordCarTelemetryInput = {
  carId: string;
  companyId: string;
  latitude: number;
  longitude: number;
  recordedAt?: Date;
  speed?: number;
  remainFuel?: number;
  fuelAmount?: number;
  resistance?: ResistanceReadings;
};

type IngestDeviceTelemetryInput = {
  carId: string;
  latitude: number;
  longitude: number;
  recordedAt?: Date;
  speed?: number;
  remainFuel?: number;
  fuelAmount?: number;
  resistance?: ResistanceReadings;
};

@Injectable()
export class CarTelemetryService {
  private readonly logger = new Logger(CarTelemetryService.name);

  constructor(
    private readonly tenantDb: TenantDbService,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly carsReader: CarsReader,
    private readonly realtime: CarTelemetryRealtimeService,
  ) {}

  /**
   * Persist a telemetry sample to Timescale history and refresh the Redis latest.
   */
  async record(
    context: TenantContext,
    input: RecordCarTelemetryInput,
  ): Promise<CarTelemetry> {
    const recordedAt = input.recordedAt ?? new Date();

    const markerIdentity = await this.tenantDb.run(context, async (tx) => {
      const car = await this.carsReader.getById(tx, input.carId);

      if (car.companyId !== input.companyId) {
        throw createApiException(
          HttpStatus.BAD_REQUEST,
          ApiErrorCode.VALIDATION_ERROR,
          'Car does not belong to the given company',
        );
      }

      await tx.insert(carTelemetryHistory).values({
        time: recordedAt,
        carId: input.carId,
        companyId: input.companyId,
        latitude: input.latitude,
        longitude: input.longitude,
        speed: input.speed,
        remainFuel: input.remainFuel,
        fuelAmount: input.fuelAmount,
        resistanceTankToGround: input.resistance?.tankToGround,
        resistanceTankToNozzle: input.resistance?.tankToNozzle,
        resistanceGroundToVehicle: input.resistance?.groundToVehicle,
      });

      return {
        name: car.name,
        licensePlate: car.licensePlate,
      };
    });

    const telemetry: CarTelemetry = {
      carId: input.carId,
      latitude: input.latitude,
      longitude: input.longitude,
      updatedAt: recordedAt.toISOString(),
      speed: input.speed,
      remainFuel: input.remainFuel,
      fuelAmount: input.fuelAmount,
    };

    if (input.resistance != null) {
      telemetry.resistance = {
        tankToGround: input.resistance.tankToGround,
        tankToNozzle: input.resistance.tankToNozzle,
        groundToVehicle: input.resistance.groundToVehicle,
      };
    }

    await this.redis.hset(
      companyCarTelemetryKey(input.companyId),
      input.carId,
      serializeCarTelemetry(telemetry),
    );

    const marker: CarTelemetryMarker = {
      ...telemetry,
      name: markerIdentity.name,
      licensePlate: markerIdentity.licensePlate,
    };
    await this.realtime.publish({
      type: CarTelemetrySocketEvents.TELEMETRY_UPDATED,
      companyId: input.companyId,
      marker,
    });

    return telemetry;
  }

  /**
   * Ingest a device telemetry sample from MQTT (internal context; skips unknown cars).
   */
  async ingestDeviceTelemetry(
    input: IngestDeviceTelemetryInput,
  ): Promise<CarTelemetry | null> {
    const context = internalTenantContext();

    try {
      const car = await this.tenantDb.run(context, (tx) =>
        this.carsReader.getById(tx, input.carId),
      );

      return this.record(context, {
        carId: car.id,
        companyId: car.companyId,
        latitude: input.latitude,
        longitude: input.longitude,
        recordedAt: input.recordedAt,
        speed: input.speed,
        remainFuel: input.remainFuel,
        fuelAmount: input.fuelAmount,
        resistance: input.resistance,
      });
    } catch (error) {
      if (isNotFoundApiException(error)) {
        this.logger.warn(
          `Ignoring telemetry sample for unknown car ${input.carId}`,
        );
        return null;
      }

      throw error;
    }
  }

  /** Latest telemetry for the current tenant, joined with car identity. */
  async listMarkers(context: TenantContext): Promise<CarTelemetryMarker[]> {
    if (!context.companyId) {
      return [];
    }

    const [fleet, telemetryByCarId] = await Promise.all([
      this.tenantDb.run(context, async (tx) => {
        return tx
          .select({
            id: cars.id,
            name: cars.name,
            licensePlate: cars.licensePlate,
          })
          .from(cars);
      }),
      this._readCompanyTelemetry(context.companyId),
    ]);

    const markers: CarTelemetryMarker[] = [];

    for (const car of fleet) {
      const telemetry = telemetryByCarId.get(car.id);
      if (!telemetry) {
        continue;
      }

      markers.push({
        ...telemetry,
        name: car.name,
        licensePlate: car.licensePlate,
      });
    }

    return markers;
  }

  async clearForCar(companyId: string, carId: string): Promise<void> {
    await this.redis.hdel(companyCarTelemetryKey(companyId), carId);
    await this.realtime.publish({
      type: CarTelemetrySocketEvents.TELEMETRY_REMOVED,
      companyId,
      carId,
    });
  }

  private async _readCompanyTelemetry(
    companyId: string,
  ): Promise<Map<string, CarTelemetry>> {
    const raw: Record<string, string> = await this.redis.hgetall(
      companyCarTelemetryKey(companyId),
    );
    const telemetryByCarId = new Map<string, CarTelemetry>();

    for (const [carId, value] of Object.entries(raw)) {
      const telemetry = parseCarTelemetry(carId, value);
      if (telemetry) {
        telemetryByCarId.set(carId, telemetry);
      }
    }

    return telemetryByCarId;
  }
}

function isNotFoundApiException(error: unknown): boolean {
  if (!(error instanceof ApiException)) {
    return false;
  }

  const response = error.getResponse();
  return (
    typeof response === 'object' &&
    response !== null &&
    'code' in response &&
    response.code === ApiErrorCode.NOT_FOUND
  );
}
