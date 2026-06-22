import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { companies } from './companies';

/** Tenant-owned resource: every row carries company_id for RLS enforcement. */
export const drivers = pgTable('drivers', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  nationalId: varchar('national_id', { length: 32 }).notNull().unique(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
