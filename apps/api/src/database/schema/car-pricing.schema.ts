import {
  doublePrecision,
  index,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { cars } from './cars.schema';
import { companies } from './companies.schema';

/**
 * One pricing row per car. `car_id` is the owner — petrol price and fee bands
 * are not company-wide.
 */
export const carPricing = pgTable(
  'car_pricing',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    carId: uuid('car_id')
      .notNull()
      .unique()
      .references(() => cars.id, { onDelete: 'cascade' }),
    /** Denormalized for row-level security. Kept in sync with the car. */
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'restrict' }),
    petrolPricePerLiter: doublePrecision('petrol_price_per_liter'),
    feeThresholdX: doublePrecision('fee_threshold_x'),
    feeThresholdY: doublePrecision('fee_threshold_y'),
    feeThresholdZ: doublePrecision('fee_threshold_z'),
    feeUpToX: doublePrecision('fee_up_to_x'),
    feeXToY: doublePrecision('fee_x_to_y'),
    feeYToZ: doublePrecision('fee_y_to_z'),
    feeAboveZ: doublePrecision('fee_above_z'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('car_pricing_company_id_idx').on(table.companyId)],
);
