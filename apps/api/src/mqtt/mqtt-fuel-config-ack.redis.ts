import type { CarFuelConfigCommandResult } from '@fuel-carrier/shared-types';

/** Cross-instance fan-out for truck `fuel-config-ack` MQTT replies. */
export const MQTT_FUEL_CONFIG_ACK_CHANNEL = 'mqtt-fuel-config-ack';

export type MqttFuelConfigAckEvent = CarFuelConfigCommandResult & {
  carId: string;
};

export function parseFuelConfigAckEvent(
  raw: string | null | undefined,
): MqttFuelConfigAckEvent | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isFuelConfigAckEvent(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isFuelConfigAckEvent(value: unknown): value is MqttFuelConfigAckEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const event = value as MqttFuelConfigAckEvent;
  return (
    typeof event.carId === 'string' &&
    typeof event.commandId === 'number' &&
    typeof event.success === 'boolean' &&
    typeof event.message === 'string'
  );
}
