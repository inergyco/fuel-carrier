import { truncate } from '../common/string.utils';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
  STALE_TELEMETRY_THRESHOLD_MS,
} from '../config/notification.config';

export const isStaleTelemetry = (input: {
  recordedAt: Date;
  ingestedAt: Date;
}): boolean =>
  input.ingestedAt.getTime() - input.recordedAt.getTime() >
  STALE_TELEMETRY_THRESHOLD_MS;

export function buildStaleTelemetryAlertMessage(input: {
  licensePlate: string;
  recordedAt: Date;
  ingestedAt: Date;
}): { title: string; body: string; pushTitle: string } {
  const ageMinutes = Math.round(
    (input.ingestedAt.getTime() - input.recordedAt.getTime()) / 60_000,
  );
  const title = truncate('Stale telemetry', NOTIFICATION_TITLE_MAX_LENGTH);
  const pushTitle = truncate(
    `Stale telemetry — ${input.licensePlate}`,
    NOTIFICATION_TITLE_MAX_LENGTH,
  );
  const body = truncate(
    `The device sample is about ${ageMinutes} minutes old (limit ${STALE_TELEMETRY_THRESHOLD_MS / 60_000} minutes).`,
    NOTIFICATION_BODY_MAX_LENGTH,
  );

  return { title, body, pushTitle };
}
