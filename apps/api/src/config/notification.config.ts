/**
 * API-local notification limits.
 * Importing the shared-types copies poisons Drizzle column types in the notifications schema.
 */
export const NOTIFICATION_TITLE_MAX_LENGTH = 120;
export const NOTIFICATION_BODY_MAX_LENGTH = 2000;
export const NOTIFICATION_LICENSE_PLATE_MAX_LENGTH = 32;

/** Device sample older than this vs ingest time opens a stale-telemetry alert. */
export const STALE_TELEMETRY_THRESHOLD_MS = 30 * 60 * 1000;
