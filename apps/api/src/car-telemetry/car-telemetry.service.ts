import { Inject, Injectable, Logger } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types/api-error-code';
import {
  CarTelemetrySocketEvents,
  type CarTelemetry,
  type CarTelemetryMarker,
} from '@fuel-carrier/shared-types/car-telemetry';
import type { TenantContext } from '@fuel-carrier/shared-types/tenant-context';
import Redis from 'ioredis';
import { CarsReader } from '../cars/cars-reader.service';
import { ApiException } from '../common/exceptions/api.exception';
import { companies } from '../database/schema/companies.schema';
import type { CarTelemetryMode } from '../database/schema/car-telemetry-history.schema';
import { internalTenantContext } from '../database/tenant-context.utils';
import { TenantDbService } from '../database/tenant-db.service';
import { CarConditionAlertService } from '../notifications/car-condition-alert.service';
import { REDIS } from '../redis/redis.tokens';
import { CarTelemetryRealtimeService } from './car-telemetry-realtime.service';
import {
  CarTelemetryUtils,
  type FleetCar,
  type RecordCarTelemetryInput,
} from './car-telemetry.utils';
import {
  companyCarTelemetryKey,
  parseCarTelemetry,
  serializeCarTelemetry,
} from './car-telemetry.redis';

type IngestDeviceTelemetryInput = {
  carId: string;
  latitude: number;
  longitude: number;
  recordedAt?: Date;
  speed?: number;
  remainFuel?: number;
  fuelAmount?: number;
  mode?: CarTelemetryMode;
  resistance?: RecordCarTelemetryInput['resistance'];
};

type ListCarTelemetryHistoryInput = {
  carId: string;
  start?: Date;
  end?: Date;
};

@Injectable()
export class CarTelemetryService {
  private readonly logger = new Logger(CarTelemetryService.name);

  constructor(
    private readonly tenantDb: TenantDbService,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly carsReader: CarsReader,
    private readonly realtime: CarTelemetryRealtimeService,
    private readonly carConditionAlerts: CarConditionAlertService,
  ) {}

  /**
   * Persist a telemetry sample to Timescale history and refresh the Redis latest.
   */
  async record(
    context: TenantContext,
    input: RecordCarTelemetryInput,
  ): Promise<CarTelemetry> {
    const recordedAt = input.recordedAt ?? new Date();
    const ingestedAt = new Date();
    const mode = input.mode ?? 'idle';
    const sample = { input, recordedAt, ingestedAt, mode };

    const carIdentity = await this.tenantDb.run(context, (tx) =>
      CarTelemetryUtils.persistSample(tx, sample),
    );
    const telemetry = CarTelemetryUtils.toRecordedTelemetry(sample);

    await this.redis.hset(
      companyCarTelemetryKey(input.companyId),
      input.carId,
      serializeCarTelemetry(telemetry),
    );

    const marker: CarTelemetryMarker = {
      ...telemetry,
      licensePlate: carIdentity.licensePlate,
      companyId: input.companyId,
      companyName: carIdentity.companyName,
      hasHighGrade: carIdentity.hasHighGrade,
      tankCount: carIdentity.tankCount,
      tankCapacityLiters: carIdentity.tankCapacityLiters,
    };
    await this.realtime.publish({
      type: CarTelemetrySocketEvents.TELEMETRY_UPDATED,
      companyId: input.companyId,
      marker,
    });

    await this.carConditionAlerts.evaluateAfterTelemetry({
      carId: input.carId,
      companyId: input.companyId,
      licensePlate: carIdentity.licensePlate,
      tankCount: carIdentity.tankCount,
      tankCapacityLiters: carIdentity.tankCapacityLiters,
      recordedAt,
      ingestedAt,
      resistance: input.resistance,
      remainFuel: input.remainFuel,
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
        mode: input.mode,
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

    return this._listMarkersForCompanies(context, [context.companyId]);
  }

  /** Latest telemetry for every company (internal admin fleet map). */
  async listAllMarkers(): Promise<CarTelemetryMarker[]> {
    const context = internalTenantContext();
    const companyIds = await this.tenantDb.run(context, async (tx) => {
      const rows = await tx.select({ id: companies.id }).from(companies);
      return rows.map((row) => row.id);
    });

    return this._listMarkersForCompanies(context, companyIds);
  }

  async listHistory(
    context: TenantContext,
    input: ListCarTelemetryHistoryInput,
  ): Promise<CarTelemetry[]> {
    return this.tenantDb.run(context, (tx) =>
      CarTelemetryUtils.loadHistory(tx, {
        companyId: context.companyId,
        carId: input.carId,
        start: input.start,
        end: input.end,
      }),
    );
  }

  async clearForCar(companyId: string, carId: string): Promise<void> {
    await this.redis.hdel(companyCarTelemetryKey(companyId), carId);
    await this.realtime.publish({
      type: CarTelemetrySocketEvents.TELEMETRY_REMOVED,
      companyId,
      carId,
    });
  }

  /**
   * Latest remainFuel values keyed by car id for one company (Redis latest cache).
   */
  async getRemainFuelByCarId(
    companyId: string,
  ): Promise<Map<string, number | undefined>> {
    const telemetry = await this._readCompanyTelemetry(companyId);
    const remainFuelByCarId = new Map<string, number | undefined>();

    for (const sample of telemetry) {
      remainFuelByCarId.set(sample.carId, sample.remainFuel);
    }

    return remainFuelByCarId;
  }

  private async _listMarkersForCompanies(
    context: TenantContext,
    companyIds: string[],
  ): Promise<CarTelemetryMarker[]> {
    if (companyIds.length === 0) {
      return [];
    }

    const [fleet, telemetryByCompany] = await Promise.all([
      this._listFleetCars(context),
      this._readCompaniesTelemetry(companyIds),
    ]);

    await this._clearTelemetryForMissingCars({
      fleet,
      telemetryByCompany,
    });

    return CarTelemetryUtils.toMarkers(fleet, telemetryByCompany);
  }

  private async _listFleetCars(context: TenantContext): Promise<FleetCar[]> {
    return this.tenantDb.run(context, (tx) =>
      CarTelemetryUtils.listLiveFleetCars(tx),
    );
  }

  private async _clearTelemetryForMissingCars(options: {
    fleet: FleetCar[];
    telemetryByCompany: ReadonlyMap<string, CarTelemetry[]>;
  }): Promise<void> {
    const removed = CarTelemetryUtils.listRemovedCars(options);
    await Promise.all(
      removed.map((entry) => this.clearForCar(entry.companyId, entry.carId)),
    );
  }

  private async _readCompaniesTelemetry(
    companyIds: string[],
  ): Promise<Map<string, CarTelemetry[]>> {
    const entries = await Promise.all(
      companyIds.map(
        async (companyId) =>
          [companyId, await this._readCompanyTelemetry(companyId)] as const,
      ),
    );

    return new Map(entries);
  }

  private async _readCompanyTelemetry(
    companyId: string,
  ): Promise<CarTelemetry[]> {
    const raw: Record<string, string> = await this.redis.hgetall(
      companyCarTelemetryKey(companyId),
    );
    const telemetry: CarTelemetry[] = [];

    for (const [carId, value] of Object.entries(raw)) {
      const parsed = parseCarTelemetry(carId, value);
      if (parsed) {
        telemetry.push(parsed);
      }
    }

    return telemetry;
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
