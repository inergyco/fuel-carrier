import {
  DEFAULT_TANK_CAPACITY_LITERS,
  DEFAULT_TANK_COUNT,
  MAX_TANK_CAPACITY_LITERS,
  MAX_TANK_COUNT,
  MIN_TANK_CAPACITY_LITERS,
  MIN_TANK_COUNT,
} from '@fuel-carrier/shared-types';
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { companies } from './companies.schema';
import { drivers } from './drivers.schema';
import { softDeleteColumn } from './soft-delete.schema';

/** Tenant-owned resource: every row carries company_id for RLS enforcement. */
export const cars = pgTable(
  'cars',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    licensePlate: varchar('license_plate', { length: 32 }).notNull(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    /** One-to-one: each driver may be assigned to at most one car. */
    driverId: uuid('driver_id').unique(),
    /** True when the vehicle has high-grade petrol; false = normal. */
    hasHighGrade: boolean('has_high_grade').notNull().default(false),
    /** Integer compartment count, from 1 to 3. Every tank shares `tankCapacityLiters`. */
    tankCount: integer('tank_count').notNull().default(DEFAULT_TANK_COUNT),
    /** Liters per tank. */
    tankCapacityLiters: integer('tank_capacity_liters')
      .notNull()
      .default(DEFAULT_TANK_CAPACITY_LITERS),
    note: text('note'),
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
    /**
     * Soft-deleted plates may be reused — uniqueness only among live rows.
     */
    uniqueIndex('cars_license_plate_unique')
      .on(table.licensePlate)
      .where(sql`${table.deletedAt} IS NULL`),
    check(
      'cars_tank_count_check',
      sql`${table.tankCount} BETWEEN ${sql.raw(String(MIN_TANK_COUNT))} AND ${sql.raw(String(MAX_TANK_COUNT))}`,
    ),
    check(
      'cars_tank_capacity_liters_check',
      sql`${table.tankCapacityLiters} BETWEEN ${sql.raw(String(MIN_TANK_CAPACITY_LITERS))} AND ${sql.raw(String(MAX_TANK_CAPACITY_LITERS))}`,
    ),
    /**
     * Composite FK: assigned driver must belong to the same company as the car.
     * MATCH SIMPLE: null driver_id skips the check. ON DELETE NO ACTION — clear
     * cars.driver_id before deleting a driver (see DriversService.delete).
     */
    foreignKey({
      columns: [table.driverId, table.companyId],
      foreignColumns: [drivers.id, drivers.companyId],
      name: 'cars_driver_id_company_id_drivers_id_company_id_fk',
    }).onDelete('no action'),
  ],
);
