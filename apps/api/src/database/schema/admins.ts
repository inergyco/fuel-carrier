import { check, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { USERNAME_MAX_LENGTH } from '@fuel-carrier/shared-validation/username';

export const admins = pgTable(
  'admins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    username: varchar('username', { length: USERNAME_MAX_LENGTH })
      .notNull()
      .unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check('admins_username_length', sql`char_length(${table.username}) >= 3`),
    check(
      'admins_username_format',
      sql`${table.username} ~ '^[a-zA-Z0-9_-]+$'`,
    ),
  ],
);
