import { randomInt } from 'node:crypto';
import { z } from 'zod';
import {
  CarOutputActions,
  type CarOutputAction,
  type CarOutputCommandResult,
} from '@fuel-carrier/shared-types';

const OUTPUT_ACK_TOPIC =
  /^telemetry\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/output-ack$/i;

const MAX_UINT32 = 0xffff_ffff;

const outputCommandPayloadSchema = z.object({
  version: z.literal(1),
  company: z.object({
    id: z.string().min(1),
  }),
  device: z.object({
    deviceId: z.string().min(1),
  }),
  command: z.object({
    commandId: z.number().int().min(0).max(MAX_UINT32),
    action: z.enum([CarOutputActions.ENABLE, CarOutputActions.DISABLE]),
  }),
});

const outputAckPayloadSchema = z.object({
  version: z.number().optional(),
  success: z.boolean(),
  companyId: z.string().optional(),
  deviceId: z.string().optional(),
  commandId: z.number().int(),
  action: z.enum([CarOutputActions.ENABLE, CarOutputActions.DISABLE]),
  pins: z
    .object({
      gpio25: z.boolean(),
      gpio26: z.boolean(),
    })
    .optional(),
  message: z.string(),
  deviceTime: z.string().optional(),
});

export type MqttDeviceIdentity = {
  companyCode: string;
  deviceId: string;
};

/** Resolve MQTT company/device codes from stored firmware IDs (both required). */
export function toMqttDeviceIdentity(identity: {
  firmwareCompanyId: string | null;
  firmwareDeviceId: string | null;
}): MqttDeviceIdentity | null {
  const companyCode = identity.firmwareCompanyId?.trim();
  const deviceId = identity.firmwareDeviceId?.trim();
  if (!companyCode || !deviceId) {
    return null;
  }

  return { companyCode, deviceId };
}

export type MqttOutputCommandPayload = z.infer<
  typeof outputCommandPayloadSchema
>;

export type ParsedOutputAck = CarOutputCommandResult & {
  carId: string;
};

/** Build the SDD §18 GPIO command JSON body. */
export function buildOutputCommandPayload(options: {
  identity: MqttDeviceIdentity;
  action: CarOutputAction;
  commandId?: number;
}): MqttOutputCommandPayload {
  return outputCommandPayloadSchema.parse({
    version: 1,
    company: { id: options.identity.companyCode },
    device: { deviceId: options.identity.deviceId },
    command: {
      commandId: options.commandId ?? nextOutputCommandId(),
      action: options.action,
    },
  });
}

/** Parse a device `output-ack` MQTT message. */
export function parseOutputAckPayload(
  topic: string,
  raw: string | Buffer,
): ParsedOutputAck | null {
  const carId = parseOutputAckCarId(topic);
  if (!carId) {
    return null;
  }

  let json: unknown;
  try {
    json = JSON.parse(raw.toString());
  } catch {
    return null;
  }

  const parsed = outputAckPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return null;
  }

  const result: ParsedOutputAck = {
    carId,
    success: parsed.data.success,
    action: parsed.data.action,
    commandId: parsed.data.commandId,
    message: parsed.data.message,
  };

  if (parsed.data.pins) {
    result.pins = parsed.data.pins;
  }

  if (parsed.data.deviceTime) {
    result.deviceTime = parsed.data.deviceTime;
  }

  return result;
}

export function parseOutputAckCarId(topic: string): string | null {
  const match = OUTPUT_ACK_TOPIC.exec(topic);
  return match?.[1]?.toLowerCase() ?? null;
}

export function isOutputAckTopic(topic: string): boolean {
  return OUTPUT_ACK_TOPIC.test(topic);
}

/** Random uint32 command id for GPIO commands. */
export function nextOutputCommandId(): number {
  return randomInt(0, MAX_UINT32 + 1);
}
