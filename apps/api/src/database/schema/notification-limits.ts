/**
 * API-local copies of the shared notification limits.
 * Importing them from `@fuel-carrier/shared-types` poisons Drizzle column types in this schema.
 */
export const NOTIFICATION_TITLE_MAX_LENGTH = 120;
export const NOTIFICATION_BODY_MAX_LENGTH = 2000;
export const NOTIFICATION_LICENSE_PLATE_MAX_LENGTH = 32;
