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
 * Append-only device telemetry trail stored as a TimescaleDB hypertable
 * (partitioned on time). `time` is the device-reported sample time;
 * `createdAt` is when we ingested the row.
 * Latest telemetry for the live map is kept in Redis, not here.
 */
export const carTelemetryHistory = pgTable(
  'car_telemetry_history',
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
    /** Ground speed from device telemetry (km/h when provided). */
    speed: doublePrecision('speed'),
    /** Remaining fuel volume in liters. */
    remainFuel: doublePrecision('remain_fuel'),
    /** Last dispensed amount in liters. */
    fuelAmount: doublePrecision('fuel_amount'),
    /** Insulation resistance: tank → ground (ohms). */
    resistanceTankToGround: doublePrecision('resistance_tank_to_ground'),
    /** Insulation resistance: tank → nozzle / manifold (ohms). */
    resistanceTankToNozzle: doublePrecision('resistance_tank_to_nozzle'),
    /** Bonding resistance: ground → vehicle (ohms). */
    resistanceGroundToVehicle: doublePrecision('resistance_ground_to_vehicle'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.time, table.carId] }),
    index('car_telemetry_history_company_id_time_idx').on(
      table.companyId,
      table.time,
    ),
    index('car_telemetry_history_car_id_time_idx').on(table.carId, table.time),
  ],
);
