import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { drivers } from './drivers';

/** Tenant-owned resource: every row carries company_id for RLS enforcement. */
export const cars = pgTable('cars', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }),
  licensePlate: varchar('license_plate', { length: 32 }).notNull().unique(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  /** One-to-one: each driver may be assigned to at most one car. */
  driverId: uuid('driver_id')
    .unique()
    .references(() => drivers.id, { onDelete: 'set null' }),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
