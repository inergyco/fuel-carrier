import { sql } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { softDeleteColumn } from './soft-delete';

/** Tenant-owned resource: every row carries company_id for RLS enforcement. */
export const drivers = pgTable(
  'drivers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    nationalId: varchar('national_id', { length: 32 }).notNull(),
    mobileNumber: varchar('mobile_number', { length: 20 }).notNull(),
    imageUrl: varchar('image_url', { length: 2048 }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    ...softDeleteColumn(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    /** Soft-deleted national IDs may be reused — uniqueness only among live rows. */
    uniqueIndex('drivers_national_id_unique')
      .on(table.nationalId)
      .where(sql`${table.deletedAt} IS NULL`),
    /**
     * Soft-deleted mobiles may be reused. Empty values (legacy backfill) are
     * excluded so multiple unset rows do not collide until a real number is set.
     */
    uniqueIndex('drivers_mobile_number_unique')
      .on(table.mobileNumber)
      .where(sql`${table.deletedAt} IS NULL AND ${table.mobileNumber} <> ''`),
    /** Allows cars(driver_id, company_id) → drivers(id, company_id) composite FK. */
    unique('drivers_id_company_id_unique').on(table.id, table.companyId),
  ],
);
