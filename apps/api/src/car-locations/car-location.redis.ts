import type { CarLocation } from '@fuel-carrier/shared-types';

export function companyCarLocationsKey(companyId: string): string {
  return `company:${companyId}:car-locations`;
}

type ResistanceReadings = {
  tankToGround: number;
  tankToNozzle: number;
  groundToVehicle: number;
};

type RedisCarLocationPayload = {
  latitude: number;
  longitude: number;
  updatedAt: string;
  speed?: number;
  remainFuel?: number;
  fuelAmount?: number;
  resistance?: ResistanceReadings;
};

/** Latest position fields accepted by Redis serialization (`updatedAt` may be a Date). */
type SerializableCarLocation = Pick<
  CarLocation,
  | 'latitude'
  | 'longitude'
  | 'speed'
  | 'remainFuel'
  | 'fuelAmount'
  | 'resistance'
> & {
  updatedAt: Date | string;
};

export function serializeCarLocation(
  location: SerializableCarLocation,
): string {
  const payload: RedisCarLocationPayload = {
    latitude: location.latitude,
    longitude: location.longitude,
    updatedAt:
      typeof location.updatedAt === 'string'
        ? location.updatedAt
        : location.updatedAt.toISOString(),
  };

  if (location.speed != null) {
    payload.speed = location.speed;
  }
  if (location.remainFuel != null) {
    payload.remainFuel = location.remainFuel;
  }
  if (location.fuelAmount != null) {
    payload.fuelAmount = location.fuelAmount;
  }

  const resistance = parseResistance(location.resistance);
  if (resistance != null) {
    payload.resistance = resistance;
  }

  return JSON.stringify(payload);
}

export function parseCarLocation(
  carId: string,
  raw: string | null | undefined,
): CarLocation | null {
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

    const location: CarLocation = {
      carId,
      latitude,
      longitude,
      updatedAt,
    };

    if (typeof record.speed === 'number') {
      location.speed = record.speed;
    }
    if (typeof record.remainFuel === 'number') {
      location.remainFuel = record.remainFuel;
    }
    if (typeof record.fuelAmount === 'number') {
      location.fuelAmount = record.fuelAmount;
    }

    const resistance = parseResistance(record.resistance);
    if (resistance != null) {
      location.resistance = resistance;
    }

    return location;
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
