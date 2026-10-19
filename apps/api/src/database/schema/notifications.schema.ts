import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import type { CompanyUserLevel } from '@fuel-carrier/shared-types/company-user-level';
import type { NotificationChannel } from '@fuel-carrier/shared-types/notification';
import { companies } from './companies.schema';
import { companyUsers } from './company-users.schema';
import { users } from './users.schema';

/**
 * Keep these numeric literals local. Importing shared max-length consts into
 * this schema module makes Drizzle column types resolve as `error` under the
 * API ESLint type-checker and poisons every insert/select in the service.
 * Values must stay aligned with NOTIFICATION_*_MAX_LENGTH in shared-types.
 */
const NOTIFICATION_TITLE_MAX_LENGTH = 120;
const NOTIFICATION_BODY_MAX_LENGTH = 2000;

/**
 * One admin-composed message and the audience it was sent to.
 * `channel` is the delivery method. Browser is the only channel today.
 * SMS and others add a channel value. Each recipient still gets one delivery row.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    channel: varchar('channel', { length: 16 })
      .notNull()
      .$type<NotificationChannel>(),
    title: varchar('title', { length: 120 }).notNull(),
    body: text('body').notNull(),
    levels: text('levels').array().notNull().$type<CompanyUserLevel[]>(),
    recipientCount: integer('recipient_count').notNull(),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('notifications_created_at_idx').on(table.createdAt),
    check('notifications_channel_check', sql`${table.channel} IN ('browser')`),
    check(
      'notifications_title_length',
      sql`char_length(${table.title}) BETWEEN 1 AND ${sql.raw(String(NOTIFICATION_TITLE_MAX_LENGTH))}`,
    ),
    check(
      'notifications_body_length',
      sql`char_length(${table.body}) BETWEEN 1 AND ${sql.raw(String(NOTIFICATION_BODY_MAX_LENGTH))}`,
    ),
    check(
      'notifications_levels_check',
      sql`${table.levels} <@ ARRAY['admin', 'viewer']::text[] AND cardinality(${table.levels}) > 0`,
    ),
  ],
);

/**
 * One row per staff member who matched the audience at send time.
 * `companyId` is the company the message was delivered to. Row-level
 * security allows the row from that column, the same way as cars and drivers.
 * `readAt` is the per-person state. Channel, title, body, and createdAt
 * live on `notifications`.
 */
export const notificationDeliveries = pgTable(
  'notification_deliveries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    notificationId: uuid('notification_id')
      .notNull()
      .references(() => notifications.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'restrict' }),
    companyUserId: uuid('company_user_id')
      .notNull()
      .references(() => companyUsers.id, { onDelete: 'restrict' }),
    readAt: timestamp('read_at', { withTimezone: true }),
  },
  (table) => [
    index('notification_deliveries_company_user_id_idx').on(
      table.companyUserId,
    ),
    index('notification_deliveries_notification_id_idx').on(
      table.notificationId,
    ),
  ],
);

/**
 * One browser Push API subscription. The endpoint belongs to a device, so a
 * later sign-in on that browser replaces the previous staff member.
 * Writes run as internal after the session's company user is resolved, because
 * company RLS would hide the previous owner's row. `companyId` stays on the
 * row for the same tenant check used by deliveries.
 */
export const notificationPushSubscriptions = pgTable(
  'notification_push_subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'restrict' }),
    companyUserId: uuid('company_user_id')
      .notNull()
      .references(() => companyUsers.id, { onDelete: 'restrict' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    authKey: text('auth_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('notification_push_subscriptions_endpoint_uidx').on(
      table.endpoint,
    ),
    index('notification_push_subscriptions_company_user_id_idx').on(
      table.companyUserId,
    ),
  ],
);
