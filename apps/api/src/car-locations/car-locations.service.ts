import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import type { TenantContext } from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  CarLocationSocketEvents,
  type CarLocation,
  type CarLocationMarker,
} from '@fuel-carrier/shared-types';
import Redis from 'ioredis';
import { CarsReader } from '../cars/cars-reader.service';
import {
  ApiException,
  createApiException,
} from '../common/exceptions/api.exception';
import { cars } from '../database/schema/cars';
import { carLocationHistory } from '../database/schema/car-location-history';
import { internalTenantContext } from '../database/tenant-context.utils';
import { TenantDbService } from '../database/tenant-db.service';
import { REDIS } from '../redis/redis.tokens';
import {
  companyCarLocationsKey,
  parseCarLocation,
  serializeCarLocation,
} from './car-location.redis';
import { CarLocationsRealtimeService } from './car-locations-realtime.service';

type ResistanceReadings = {
  tankToGround: number;
  tankToNozzle: number;
  groundToVehicle: number;
};

type RecordCarLocationInput = {
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
export class CarLocationsService {
  private readonly logger = new Logger(CarLocationsService.name);

  constructor(
    private readonly tenantDb: TenantDbService,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly carsReader: CarsReader,
    private readonly realtime: CarLocationsRealtimeService,
  ) {}

  /**
   * Persist a GPS sample to Timescale history and refresh the Redis latest position.
   */
  async record(
    context: TenantContext,
    input: RecordCarLocationInput,
  ): Promise<CarLocation> {
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

      await tx.insert(carLocationHistory).values({
        time: recordedAt,
        carId: input.carId,
        companyId: input.companyId,
        latitude: input.latitude,
        longitude: input.longitude,
      });

      return {
        name: car.name,
        licensePlate: car.licensePlate,
      };
    });

    const location: CarLocation = {
      carId: input.carId,
      latitude: input.latitude,
      longitude: input.longitude,
      updatedAt: recordedAt.toISOString(),
      speed: input.speed,
      remainFuel: input.remainFuel,
      fuelAmount: input.fuelAmount,
    };

    if (input.resistance != null) {
      location.resistance = {
        tankToGround: input.resistance.tankToGround,
        tankToNozzle: input.resistance.tankToNozzle,
        groundToVehicle: input.resistance.groundToVehicle,
      };
    }

    await this.redis.hset(
      companyCarLocationsKey(input.companyId),
      input.carId,
      serializeCarLocation(location),
    );

    const marker: CarLocationMarker = {
      ...location,
      name: markerIdentity.name,
      licensePlate: markerIdentity.licensePlate,
    };
    await this.realtime.publish({
      type: CarLocationSocketEvents.LOCATION_UPDATED,
      companyId: input.companyId,
      marker,
    });

    return location;
  }

  /**
   * Ingest a device telemetry sample from MQTT (internal context; skips unknown cars).
   */
  async ingestDeviceTelemetry(
    input: IngestDeviceTelemetryInput,
  ): Promise<CarLocation | null> {
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

  /** Latest positions for the current tenant, joined with car identity. */
  async listMarkers(context: TenantContext): Promise<CarLocationMarker[]> {
    if (!context.companyId) {
      return [];
    }

    const [fleet, locationsByCarId] = await Promise.all([
      this.tenantDb.run(context, async (tx) => {
        return tx
          .select({
            id: cars.id,
            name: cars.name,
            licensePlate: cars.licensePlate,
          })
          .from(cars);
      }),
      this._readCompanyLocations(context.companyId),
    ]);

    const markers: CarLocationMarker[] = [];

    for (const car of fleet) {
      const location = locationsByCarId.get(car.id);
      if (!location) {
        continue;
      }

      markers.push({
        ...location,
        name: car.name,
        licensePlate: car.licensePlate,
      });
    }

    return markers;
  }

  async clearForCar(companyId: string, carId: string): Promise<void> {
    await this.redis.hdel(companyCarLocationsKey(companyId), carId);
    await this.realtime.publish({
      type: CarLocationSocketEvents.LOCATION_REMOVED,
      companyId,
      carId,
    });
  }

  private async _readCompanyLocations(
    companyId: string,
  ): Promise<Map<string, CarLocation>> {
    const raw: Record<string, string> = await this.redis.hgetall(
      companyCarLocationsKey(companyId),
    );
    const locations = new Map<string, CarLocation>();

    for (const [carId, value] of Object.entries(raw)) {
      const location = parseCarLocation(carId, value);
      if (location) {
        locations.set(carId, location);
      }
    }

    return locations;
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
