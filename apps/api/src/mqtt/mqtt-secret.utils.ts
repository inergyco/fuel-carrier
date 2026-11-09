import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../auth/password.utils';

const MQTT_SECRET_BYTES = 32;

/** Random device secret (URL-safe). Not subject to interactive password rules. */
export function generateMqttSecret(): string {
  return randomBytes(MQTT_SECRET_BYTES).toString('base64url');
}

export async function hashMqttSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, BCRYPT_ROUNDS);
}

export function buildMqttTelemetryTopic(carId: string): string {
  return `telemetry/${carId}/#`;
}

/**
 * Mosquitto shared subscription so multiple API processes can compete for
 * each telemetry message (only one member of the group receives it).
 * Message topics delivered to the client stay `telemetry/…` (publish path).
 */
export function buildMqttSharedSubscribeTopic(options: {
  shareGroup: string;
  topicFilter: string;
}): string {
  const topicFilter = stripMqttSharePrefix(options.topicFilter);
  return `$share/${options.shareGroup}/${topicFilter}`;
}

/** Exact topic the backend publishes telemetry ACKs to. */
export function buildMqttAckTopic(carId: string): string {
  return `ack/${carId}`;
}

function stripMqttSharePrefix(topicFilter: string): string {
  return topicFilter.replace(/^\$share\/[^/]+\//, '');
}

/** Topic pattern the device may subscribe to for ACKs. */
export function buildMqttAckSubscribeTopic(carId: string): string {
  return `ack/${carId}/#`;
}
