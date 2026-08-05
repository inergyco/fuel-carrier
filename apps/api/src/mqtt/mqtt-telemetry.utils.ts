import { z } from 'zod';

const CAR_ID_IN_TOPIC =
  /^telemetry\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i;

/**
 * Industrial fuel telemetry packet (SDD §18), published over MQTT as JSON.
 * Car identity still comes from the topic `telemetry/<carId>/…`.
 */
const telemetryPacketSchema = z.object({
  version: z.number().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    speed: z.number().optional(),
  }),
  transaction: z
    .object({
      deviceTime: z.union([z.string().min(1), z.number()]).optional(),
    })
    .optional(),
  fuel: z
    .object({
      pricePerLiter: z.number().optional(),
      fuelAmount: z.number().optional(),
      remainFuel: z.number().optional(),
      wage: z.number().optional(),
    })
    .optional(),
  resistance: z
    .object({
      tankToGround: z.number(),
      tankToNozzle: z.number(),
      groundToVehicle: z.number(),
    })
    .optional(),
  status: z
    .object({
      fuelMode: z.boolean().optional(),
      dispenseMode: z.boolean().optional(),
    })
    .optional(),
});

type ResistanceReadings = {
  tankToGround: number;
  tankToNozzle: number;
  groundToVehicle: number;
};

export type TelemetrySample = {
  carId: string;
  latitude: number;
  longitude: number;
  recordedAt?: Date;
  speed?: number;
  remainFuel?: number;
  fuelAmount?: number;
  resistance?: ResistanceReadings;
};

/** Parse an industrial telemetry JSON payload for a known car topic. */
export function parseTelemetryPayload(
  topic: string,
  raw: string | Buffer,
): TelemetrySample | null {
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

  const parsed = telemetryPacketSchema.safeParse(json);
  if (!parsed.success) {
    return null;
  }

  const sample: TelemetrySample = {
    carId,
    latitude: parsed.data.location.lat,
    longitude: parsed.data.location.lon,
    recordedAt: parseRecordedAt(parsed.data.transaction?.deviceTime),
    speed: parsed.data.location.speed,
    remainFuel: parsed.data.fuel?.remainFuel,
    fuelAmount: parsed.data.fuel?.fuelAmount,
  };

  if (parsed.data.resistance != null) {
    sample.resistance = {
      tankToGround: parsed.data.resistance.tankToGround,
      tankToNozzle: parsed.data.resistance.tankToNozzle,
      groundToVehicle: parsed.data.resistance.groundToVehicle,
    };
  }

  return sample;
}

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
