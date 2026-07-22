import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type {
  CarLocation,
  CarLocationMarker,
} from '@fuel-carrier/shared-types/car-location';
import type { TenantContext } from '@fuel-carrier/shared-types';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import Redis from 'ioredis';
import { createApiException } from '../common/exceptions/api.exception';
import { cars } from '../database/schema/cars';
import { carLocationHistory } from '../database/schema/car-location-history';
import { TenantDbService } from '../database/tenant-db.service';
import { REDIS } from '../redis/redis.tokens';
import {
  companyCarLocationsKey,
  parseCarLocation,
  serializeCarLocation,
} from './car-location.redis';

type RecordCarLocationInput = {
  carId: string;
  companyId: string;
  latitude: number;
  longitude: number;
  recordedAt?: Date;
};

@Injectable()
export class CarLocationsService {
  constructor(
    private readonly tenantDb: TenantDbService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  /**
   * Persist a GPS sample to Timescale history and refresh the Redis latest position.
   */
  async record(
    context: TenantContext,
    input: RecordCarLocationInput,
  ): Promise<CarLocation> {
    const recordedAt = input.recordedAt ?? new Date();

    await this.tenantDb.run(context, async (tx) => {
      const [car] = await tx
        .select({ id: cars.id, companyId: cars.companyId })
        .from(cars)
        .where(eq(cars.id, input.carId))
        .limit(1);

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

      await tx.insert(carLocationHistory).values({
        time: recordedAt,
        carId: input.carId,
        companyId: input.companyId,
        latitude: input.latitude,
        longitude: input.longitude,
      });
    });

    const location: CarLocation = {
      carId: input.carId,
      latitude: input.latitude,
      longitude: input.longitude,
      updatedAt: recordedAt.toISOString(),
    };

    await this.redis.hset(
      companyCarLocationsKey(input.companyId),
      input.carId,
      serializeCarLocation(location),
    );

    return location;
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
