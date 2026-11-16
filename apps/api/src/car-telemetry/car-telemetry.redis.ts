import type { CarTelemetryMode } from '../database/schema/car-telemetry-history.schema';

type ResistanceReadings = {
  tankToGround: number;
  tankToNozzle: number;
  groundToVehicle: number;
};

/** JSON stored in Redis. `carId` is the hash field, not part of the value. */
type RedisCarTelemetryPayload = {
  latitude: number;
  longitude: number;
  updatedAt: string;
  createdAt?: string;
  mode: CarTelemetryMode;
  speed?: number;
  remainFuel?: number;
  fuelAmount?: number;
  resistance?: ResistanceReadings;
};

/** Parsed hash entry: the stored payload plus the hash field. */
type CarTelemetry = RedisCarTelemetryPayload & {
  carId: string;
};

/** Latest telemetry fields accepted by Redis serialization (`updatedAt` may be a Date). */
export type SerializableCarTelemetry = Omit<
  RedisCarTelemetryPayload,
  'updatedAt' | 'createdAt'
> & {
  updatedAt: Date | string;
  createdAt?: Date | string;
};

export function companyCarTelemetryKey(companyId: string): string {
  return `company:${companyId}:car-telemetry`;
}

export function serializeCarTelemetry(
  telemetry: SerializableCarTelemetry,
): string {
  const payload: RedisCarTelemetryPayload = {
    latitude: telemetry.latitude,
    longitude: telemetry.longitude,
    updatedAt: toIsoTimestamp(telemetry.updatedAt),
    mode: telemetry.mode,
  };

  if (telemetry.createdAt != null) {
    payload.createdAt = toIsoTimestamp(telemetry.createdAt);
  }

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
      mode: parseMode(record.mode),
    };

    if (typeof record.createdAt === 'string') {
      telemetry.createdAt = record.createdAt;
    }
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

const toIsoTimestamp = (value: Date | string) =>
  typeof value === 'string' ? value : value.toISOString();

function parseMode(value: unknown): CarTelemetryMode {
  if (value === 'loading' || value === 'dispensing' || value === 'idle') {
    return value;
  }

  return 'idle';
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
