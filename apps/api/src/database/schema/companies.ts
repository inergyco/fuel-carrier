import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { softDeleteColumn } from './soft-delete';

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
