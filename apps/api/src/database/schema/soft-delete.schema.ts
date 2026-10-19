import { timestamp } from 'drizzle-orm/pg-core';

/** Nullable timestamptz — null means the row is live; set on soft-delete. */
export function softDeleteColumn() {
  return {
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  };
}
