import { z } from 'zod';

const CAR_ID_IN_TOPIC =
  /^telemetry\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i;

const gpsPayloadSchema = z.object({
  latitude: z.number().finite().gte(-90).lte(90),
  longitude: z.number().finite().gte(-180).lte(180),
  recordedAt: z.union([z.string().min(1), z.number().finite()]).optional(),
});

/** Parse a GPS JSON payload for a known car topic. */
export function parseTelemetryGpsPayload(
  topic: string,
  raw: string | Buffer,
): TelemetryGpsPayload | null {
  const carId = parseTelemetryCarId(topic);
  if (!carId) {
    return null;
  }

  let json: unknown;
  try {
    json = JSON.parse(raw.toString());
  } catch {
    return null;
  }

  const parsed = gpsPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return null;
  }

  return {
    carId,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    recordedAt: parseRecordedAt(parsed.data.recordedAt),
  };
}

export type TelemetryGpsPayload = {
  carId: string;
  latitude: number;
  longitude: number;
  recordedAt?: Date;
};

/** Extract car UUID from `telemetry/<carId>/…` topics. */
export function parseTelemetryCarId(topic: string): string | null {
  const match = CAR_ID_IN_TOPIC.exec(topic);
  return match?.[1]?.toLowerCase() ?? null;
}

function parseRecordedAt(value: string | number | undefined): Date | undefined {
  if (value == null) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}
