import { desc } from 'drizzle-orm';
import {
  doublePrecision,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { cars } from './cars.schema';
import { carTelemetryModeEnum } from './car-telemetry-history.schema';
import { companies } from './companies.schema';

/**
 * Last `transactionId` seen for a car.
 * A power-off reset stores the lower value and does not create a movement.
 * The next sample is a movement only when its id is greater than this value.
 */
export const carFuelTransactionCursors = pgTable(
  'car_fuel_transaction_cursors',
  {
    carId: uuid('car_id')
      .primaryKey()
      .references(() => cars.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    lastTransactionId: integer('last_transaction_id').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

/**
 * Load and dispense events sampled from telemetry.
 * One row per loading or dispensing sample whose `transactionId` rose.
 */
export const carFuelMovements = pgTable(
  'car_fuel_movements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    carId: uuid('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
    mode: carTelemetryModeEnum('mode').notNull(),
    liters: doublePrecision('liters'),
    /** Device `fuel.pricePerLiter` on the sample that advanced the transaction. */
    pricePerLiter: doublePrecision('price_per_liter'),
    /** Device `fuel.wage` on the sample that advanced the transaction. */
    wage: doublePrecision('wage'),
    transactionId: integer('transaction_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('car_fuel_movements_car_recorded_at_idx').on(
      table.carId,
      desc(table.recordedAt),
      desc(table.id),
    ),
    index('car_fuel_movements_company_id_idx').on(table.companyId),
  ],
);
