import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  nationalId: varchar('national_id', { length: 32 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  address: varchar('address', { length: 500 }),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
