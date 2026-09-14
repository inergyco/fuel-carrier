/** Normalize DB timestamps to ISO-8601 strings for API responses. */
export function toIsoTimestamp(value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString();
}

export function toIsoTimestampOrNull(
  value: Date | string | null | undefined,
): string | null {
  return value == null ? null : toIsoTimestamp(value);
}
