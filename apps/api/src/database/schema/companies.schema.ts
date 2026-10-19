import { sql } from 'drizzle-orm';
import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { softDeleteColumn } from './soft-delete.schema';

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    nationalId: varchar('national_id', { length: 32 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    address: varchar('address', { length: 500 }),
    note: text('note'),
    logoUrl: varchar('logo_url', { length: 2048 }),
    petrolPricePerLiter: doublePrecision('petrol_price_per_liter'),
    feeThresholdX: doublePrecision('fee_threshold_x'),
    feeThresholdY: doublePrecision('fee_threshold_y'),
    feeThresholdZ: doublePrecision('fee_threshold_z'),
    feeUpToX: doublePrecision('fee_up_to_x'),
    feeXToY: doublePrecision('fee_x_to_y'),
    feeYToZ: doublePrecision('fee_y_to_z'),
    feeAboveZ: doublePrecision('fee_above_z'),
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
    uniqueIndex('companies_national_id_unique')
      .on(table.nationalId)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
