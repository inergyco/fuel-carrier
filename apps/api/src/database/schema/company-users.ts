import {
  boolean,
  check,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
  CompanyUserLevels,
  type CompanyUserLevel,
} from '@fuel-carrier/shared-types';
import { companies } from './companies';
import { users } from './users';
import { USERNAME_MAX_LENGTH } from '@fuel-carrier/shared-validation/username';

/**
 * Company-scoped login accounts for the external panel.
 * Each row belongs to exactly one company; RLS on tenant tables enforces isolation.
 */
export const companyUsers = pgTable(
  'company_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    username: varchar('username', { length: USERNAME_MAX_LENGTH })
      .notNull()
      .unique(),
    nationalId: varchar('national_id', { length: 32 }).unique(),
    email: varchar('email', { length: 254 }),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    level: varchar('level', { length: 16 })
      .notNull()
      .default(CompanyUserLevels.ADMIN)
      .$type<CompanyUserLevel>(),
    mustChangePassword: boolean('must_change_password').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      'company_users_username_length',
      sql`char_length(${table.username}) >= 3`,
    ),
    check(
      'company_users_username_format',
      sql`${table.username} ~ '^[a-zA-Z0-9_-]+$'`,
    ),
    check(
      'company_users_level_check',
      sql`${table.level} IN ('admin', 'viewer')`,
    ),
  ],
);
