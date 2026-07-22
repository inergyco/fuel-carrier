import type { CarLocation } from '@fuel-carrier/shared-types/car-location';

export function companyCarLocationsKey(companyId: string): string {
  return `company:${companyId}:car-locations`;
}

type RedisCarLocationPayload = {
  latitude: number;
  longitude: number;
  updatedAt: string;
};

export function serializeCarLocation(
  location: Pick<CarLocation, 'latitude' | 'longitude'> & {
    updatedAt: Date | string;
  },
): string {
  const payload: RedisCarLocationPayload = {
    latitude: location.latitude,
    longitude: location.longitude,
    updatedAt:
      typeof location.updatedAt === 'string'
        ? location.updatedAt
        : location.updatedAt.toISOString(),
  };

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
    const parsed = JSON.parse(raw) as Partial<RedisCarLocationPayload>;

    if (
      typeof parsed.latitude !== 'number' ||
      typeof parsed.longitude !== 'number' ||
      typeof parsed.updatedAt !== 'string'
    ) {
      return null;
    }

    return {
      carId,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}
