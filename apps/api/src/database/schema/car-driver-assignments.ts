import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { cars } from './cars';
import { companies } from './companies';
import { drivers } from './drivers';
import { users } from './users';

/**
 * Custody intervals: when a car was assigned to a driver.
 * `cars.driver_id` remains the current-assignment cache; this table is history.
 */
export const carDriverAssignments = pgTable(
  'car_driver_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    carId: uuid('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),
    /** Nullable after driver delete; interval row is kept for history. */
    driverId: uuid('driver_id').references(() => drivers.id, {
      onDelete: 'set null',
    }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    unassignedAt: timestamp('unassigned_at', { withTimezone: true }),
    /** User (internal admin or company user) who created the assignment. */
    assignedByUserId: uuid('assigned_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    index('car_driver_assignments_car_id_assigned_at_idx').on(
      table.carId,
      table.assignedAt,
    ),
    index('car_driver_assignments_driver_id_assigned_at_idx').on(
      table.driverId,
      table.assignedAt,
    ),
    index('car_driver_assignments_company_id_assigned_at_idx').on(
      table.companyId,
      table.assignedAt,
    ),
    uniqueIndex('car_driver_assignments_car_id_open_unique')
      .on(table.carId)
      .where(sql`${table.unassignedAt} IS NULL`),
  ],
);
