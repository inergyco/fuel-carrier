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

/** Exact topic the backend publishes telemetry ACKs to. */
export function buildMqttAckTopic(carId: string): string {
  return `ack/${carId}`;
}

/** Topic pattern the device may subscribe to for ACKs. */
export function buildMqttAckSubscribeTopic(carId: string): string {
  return `ack/${carId}/#`;
}
