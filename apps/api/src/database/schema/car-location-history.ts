import {
  doublePrecision,
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { cars } from './cars';
import { companies } from './companies';

/**
 * Append-only GPS trail stored as a TimescaleDB hypertable (partitioned on time).
 * Latest position for the live map is kept in Redis, not here.
 */
export const carLocationHistory = pgTable(
  'car_location_history',
  {
    time: timestamp('time', { withTimezone: true }).notNull(),
    carId: uuid('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.time, table.carId] }),
    index('car_location_history_company_id_time_idx').on(
      table.companyId,
      table.time,
    ),
    index('car_location_history_car_id_time_idx').on(table.carId, table.time),
  ],
);
