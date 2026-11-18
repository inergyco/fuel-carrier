import type { CarOutputCommandResult } from '@fuel-carrier/shared-types';

/** Cross-instance fan-out for truck `output-ack` MQTT replies. */
export const MQTT_OUTPUT_ACK_CHANNEL = 'mqtt-output-ack';

export type MqttOutputAckEvent = CarOutputCommandResult & {
  carId: string;
};

export function serializeOutputAckEvent(event: MqttOutputAckEvent): string {
  return JSON.stringify(event);
}

export function parseOutputAckEvent(
  raw: string | null | undefined,
): MqttOutputAckEvent | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as MqttOutputAckEvent).carId !== 'string' ||
      typeof (parsed as MqttOutputAckEvent).commandId !== 'number' ||
      typeof (parsed as MqttOutputAckEvent).success !== 'boolean' ||
      typeof (parsed as MqttOutputAckEvent).action !== 'string' ||
      typeof (parsed as MqttOutputAckEvent).message !== 'string'
    ) {
      return null;
    }

    return parsed as MqttOutputAckEvent;
  } catch {
    return null;
  }
}
