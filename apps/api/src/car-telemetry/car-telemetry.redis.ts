import type { CarTelemetry } from '@fuel-carrier/shared-types';

export function companyCarTelemetryKey(companyId: string): string {
  return `company:${companyId}:car-telemetry`;
}

type ResistanceReadings = {
  tankToGround: number;
  tankToNozzle: number;
  groundToVehicle: number;
};

type RedisCarTelemetryPayload = {
  latitude: number;
  longitude: number;
  updatedAt: string;
  speed?: number;
  remainFuel?: number;
  fuelAmount?: number;
  resistance?: ResistanceReadings;
};

/** Latest telemetry fields accepted by Redis serialization (`updatedAt` may be a Date). */
type SerializableCarTelemetry = Pick<
  CarTelemetry,
  | 'latitude'
  | 'longitude'
  | 'speed'
  | 'remainFuel'
  | 'fuelAmount'
  | 'resistance'
> & {
  updatedAt: Date | string;
};

export function serializeCarTelemetry(
  telemetry: SerializableCarTelemetry,
): string {
  const payload: RedisCarTelemetryPayload = {
    latitude: telemetry.latitude,
    longitude: telemetry.longitude,
    updatedAt:
      typeof telemetry.updatedAt === 'string'
        ? telemetry.updatedAt
        : telemetry.updatedAt.toISOString(),
  };

  if (telemetry.speed != null) {
    payload.speed = telemetry.speed;
  }
  if (telemetry.remainFuel != null) {
    payload.remainFuel = telemetry.remainFuel;
  }
  if (telemetry.fuelAmount != null) {
    payload.fuelAmount = telemetry.fuelAmount;
  }

  const resistance = parseResistance(telemetry.resistance);
  if (resistance != null) {
    payload.resistance = resistance;
  }

  return JSON.stringify(payload);
}

export function parseCarTelemetry(
  carId: string,
  raw: string | null | undefined,
): CarTelemetry | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed == null) {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const latitude = record.latitude;
    const longitude = record.longitude;
    const updatedAt = record.updatedAt;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof updatedAt !== 'string'
    ) {
      return null;
    }

    const telemetry: CarTelemetry = {
      carId,
      latitude,
      longitude,
      updatedAt,
    };

    if (typeof record.speed === 'number') {
      telemetry.speed = record.speed;
    }
    if (typeof record.remainFuel === 'number') {
      telemetry.remainFuel = record.remainFuel;
    }
    if (typeof record.fuelAmount === 'number') {
      telemetry.fuelAmount = record.fuelAmount;
    }

    const resistance = parseResistance(record.resistance);
    if (resistance != null) {
      telemetry.resistance = resistance;
    }

    return telemetry;
  } catch {
    return null;
  }
}

function parseResistance(value: unknown): ResistanceReadings | null {
  if (typeof value !== 'object' || value == null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const tankToGround = record.tankToGround;
  const tankToNozzle = record.tankToNozzle;
  const groundToVehicle = record.groundToVehicle;

  if (
    typeof tankToGround !== 'number' ||
    typeof tankToNozzle !== 'number' ||
    typeof groundToVehicle !== 'number'
  ) {
    return null;
  }

  return {
    tankToGround,
    tankToNozzle,
    groundToVehicle,
  };
}
