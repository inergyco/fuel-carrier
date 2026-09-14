import { pgEnum } from 'drizzle-orm/pg-core';

export const ENTITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type DbEntityStatus = (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS];

/** Lifecycle for cars and drivers — soft-delete uses inactive. */
export const entityStatusEnum = pgEnum('entity_status', ['active', 'inactive']);
