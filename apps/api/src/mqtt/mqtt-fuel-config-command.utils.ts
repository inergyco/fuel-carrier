import { randomInt } from 'node:crypto';
import { z } from 'zod';
import {
  CAR_FUEL_CONFIG_IGNORED_VOLUME_THRESHOLD_LITERS,
  CAR_FUEL_CONFIG_INT_MAX,
  CAR_FUEL_CONFIG_INT_MIN,
  CAR_FUEL_CONFIG_PRICE_MAX,
  CarFuelConfigActions,
  CarFuelConfigFieldErrors,
  type CarFuelConfig,
  type CarFuelConfigCommandResult,
  type CarPricing,
} from '@fuel-carrier/shared-types';
import type { ApiFieldError } from '@fuel-carrier/shared-types';
import { CAR_PRICING_KEYS } from '@fuel-carrier/shared-validation/car/pricing';
import type { MqttDeviceIdentity } from './mqtt-output-command.utils';

const FUEL_CONFIG_ACK_TOPIC =
  /^telemetry\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/fuel-config-ack$/i;

const MAX_UINT32 = 0xffff_ffff;

/** GPIO samples use these ids; fuel-config must not (SDD §19). */
const RESERVED_FUEL_CONFIG_COMMAND_IDS = new Set([42, 43]);

const wholeNumberInRange = z
  .number()
  .int()
  .min(CAR_FUEL_CONFIG_INT_MIN)
  .max(CAR_FUEL_CONFIG_INT_MAX);

const fuelConfigSchema = z.object({
  pricePerLiter: z.number().positive().max(CAR_FUEL_CONFIG_PRICE_MAX),
  wage: z.tuple([
    wholeNumberInRange,
    wholeNumberInRange,
    wholeNumberInRange,
    wholeNumberInRange,
  ]),
  volumeThresholdLiters: z.tuple([
    wholeNumberInRange,
    wholeNumberInRange,
    wholeNumberInRange,
    wholeNumberInRange,
  ]),
});

const fuelConfigCommandPayloadSchema = z.object({
  version: z.literal(1),
  company: z.object({
    id: z.string().min(1),
  }),
  device: z.object({
    deviceId: z.string().min(1),
  }),
  command: z.object({
    commandId: z
      .number()
      .int()
      .min(0)
      .max(MAX_UINT32)
      .refine((commandId) => !RESERVED_FUEL_CONFIG_COMMAND_IDS.has(commandId), {
        message: 'reserved commandId',
      }),
    action: z.literal(CarFuelConfigActions.SET),
  }),
  fuelConfig: fuelConfigSchema,
});

const fuelConfigAckPayloadSchema = z.object({
  version: z.number().optional(),
  success: z.boolean(),
  companyId: z.string().optional(),
  deviceId: z.string().optional(),
  commandId: z.number().int(),
  action: z.literal(CarFuelConfigActions.SET),
  fuelConfig: fuelConfigSchema.optional(),
  message: z.string(),
  deviceTime: z.string().optional(),
});

const WAGE_FIELDS = [
  'feeUpToX',
  'feeXToY',
  'feeYToZ',
  'feeAboveZ',
] as const satisfies readonly (keyof CarPricing)[];

const THRESHOLD_FIELDS = [
  'feeThresholdX',
  'feeThresholdY',
  'feeThresholdZ',
] as const satisfies readonly (keyof CarPricing)[];

export type MqttFuelConfigCommandPayload = z.infer<
  typeof fuelConfigCommandPayloadSchema
>;

export type ParsedFuelConfigAck = CarFuelConfigCommandResult & {
  carId: string;
};

export type CarFuelConfigFromPricing =
  | { fuelConfig: CarFuelConfig }
  | { fields: ApiFieldError[] };

/** Build the SDD §19 `setFuelConfig` JSON body. */
export function buildFuelConfigCommandPayload(options: {
  identity: MqttDeviceIdentity;
  fuelConfig: CarFuelConfig;
  commandId?: number;
}): MqttFuelConfigCommandPayload {
  return fuelConfigCommandPayloadSchema.parse({
    version: 1,
    company: { id: options.identity.companyCode },
    device: { deviceId: options.identity.deviceId },
    command: {
      commandId: options.commandId ?? nextFuelConfigCommandId(),
      action: CarFuelConfigActions.SET,
    },
    fuelConfig: options.fuelConfig,
  });
}

/** Parse a device `fuel-config-ack` MQTT message. */
export function parseFuelConfigAckPayload(
  topic: string,
  raw: string | Buffer,
): ParsedFuelConfigAck | null {
  const carId = parseFuelConfigAckCarId(topic);
  if (!carId) {
    return null;
  }

  let json: unknown;
  try {
    json = JSON.parse(raw.toString());
  } catch {
    return null;
  }

  const parsed = fuelConfigAckPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return null;
  }

  const result: ParsedFuelConfigAck = {
    carId,
    success: parsed.data.success,
    commandId: parsed.data.commandId,
    message: parsed.data.message,
  };

  if (parsed.data.fuelConfig) {
    result.fuelConfig = parsed.data.fuelConfig;
  }

  if (parsed.data.deviceTime) {
    result.deviceTime = parsed.data.deviceTime;
  }

  return result;
}

/**
 * Map saved car pricing onto `fuelConfig`.
 * The fourth liter threshold is always the SDD maximum; firmware ignores it.
 */
export function toCarFuelConfig(pricing: CarPricing): CarFuelConfigFromPricing {
  const missing = CAR_PRICING_KEYS.filter((key) => pricing[key] == null);
  if (missing.length > 0) {
    return {
      fields: missing.map((field) => ({
        field,
        message: CarFuelConfigFieldErrors.INCOMPLETE,
      })),
    };
  }

  const fields: ApiFieldError[] = [];
  const pricePerLiter = pricing.petrolPricePerLiter as number;
  if (!(pricePerLiter > 0 && pricePerLiter <= CAR_FUEL_CONFIG_PRICE_MAX)) {
    fields.push({
      field: 'petrolPricePerLiter',
      message: CarFuelConfigFieldErrors.PRICE_RANGE,
    });
  }

  const wage = readWholeNumbers({
    pricing,
    keys: WAGE_FIELDS,
    message: CarFuelConfigFieldErrors.WAGE_RANGE,
    fields,
  });
  const thresholds = readWholeNumbers({
    pricing,
    keys: THRESHOLD_FIELDS,
    message: CarFuelConfigFieldErrors.THRESHOLD_RANGE,
    fields,
  });

  if (
    thresholds.length === THRESHOLD_FIELDS.length &&
    !thresholdsIncrease(thresholds)
  ) {
    for (const field of THRESHOLD_FIELDS) {
      fields.push({
        field,
        message: CarFuelConfigFieldErrors.THRESHOLD_ORDER,
      });
    }
  }

  if (
    fields.length > 0 ||
    wage.length !== WAGE_FIELDS.length ||
    thresholds.length !== THRESHOLD_FIELDS.length
  ) {
    return { fields };
  }

  return {
    fuelConfig: {
      pricePerLiter,
      wage: [wage[0], wage[1], wage[2], wage[3]],
      volumeThresholdLiters: [
        thresholds[0],
        thresholds[1],
        thresholds[2],
        CAR_FUEL_CONFIG_IGNORED_VOLUME_THRESHOLD_LITERS,
      ],
    },
  };
}

export function parseFuelConfigAckCarId(topic: string): string | null {
  const match = FUEL_CONFIG_ACK_TOPIC.exec(topic);
  return match?.[1]?.toLowerCase() ?? null;
}

export function isFuelConfigAckTopic(topic: string): boolean {
  return FUEL_CONFIG_ACK_TOPIC.test(topic);
}

/** Random uint32 command id, skipping the ids reserved for GPIO. */
export function nextFuelConfigCommandId(): number {
  let commandId = randomInt(0, MAX_UINT32 + 1);
  while (RESERVED_FUEL_CONFIG_COMMAND_IDS.has(commandId)) {
    commandId = randomInt(0, MAX_UINT32 + 1);
  }
  return commandId;
}

function readWholeNumbers(options: {
  pricing: CarPricing;
  keys: readonly (keyof CarPricing)[];
  message: string;
  fields: ApiFieldError[];
}): number[] {
  const values: number[] = [];

  for (const key of options.keys) {
    const whole = toWholeNumber(options.pricing[key] as number);
    if (
      whole == null ||
      whole < CAR_FUEL_CONFIG_INT_MIN ||
      whole > CAR_FUEL_CONFIG_INT_MAX
    ) {
      options.fields.push({ field: key, message: options.message });
      continue;
    }
    values.push(whole);
  }

  return values;
}

function thresholdsIncrease(thresholds: number[]): boolean {
  const [x, y, z] = thresholds;
  return x < y && y < z;
}

/** Accept values that are already whole numbers, including float noise. */
function toWholeNumber(value: number): number | null {
  if (!Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);
  if (Math.abs(value - rounded) > 1e-6) {
    return null;
  }

  return rounded;
}
