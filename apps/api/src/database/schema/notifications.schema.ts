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
import { cars } from './cars.schema';
import { companies } from './companies.schema';
import { companyUsers } from './company-users.schema';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_LICENSE_PLATE_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
} from './notification-limits';
import { users } from './users.schema';

type CarConditionAlertKind = 'high_resistance' | 'low_fuel' | 'stale_telemetry';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    channel: varchar('channel', { length: 16 })
      .notNull()
      .$type<NotificationChannel>(),
    title: varchar('title', {
      length: NOTIFICATION_TITLE_MAX_LENGTH,
    }).notNull(),
    body: text('body').notNull(),
    carId: uuid('car_id').references(() => cars.id, { onDelete: 'set null' }),
    licensePlate: varchar('license_plate', {
      length: NOTIFICATION_LICENSE_PLATE_MAX_LENGTH,
    }),
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
    index('notifications_car_id_idx').on(table.carId),
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

export const carConditionAlerts = pgTable(
  'car_condition_alerts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    carId: uuid('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'restrict' }),
    notificationId: uuid('notification_id')
      .notNull()
      .references(() => notifications.id, { onDelete: 'restrict' }),
    kind: varchar('kind', { length: 32 })
      .notNull()
      .$type<CarConditionAlertKind>(),
    openedAt: timestamp('opened_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('car_condition_alerts_car_kind_uidx').on(
      table.carId,
      table.kind,
    ),
    uniqueIndex('car_condition_alerts_notification_id_uidx').on(
      table.notificationId,
    ),
    index('car_condition_alerts_company_id_idx').on(table.companyId),
    check(
      'car_condition_alerts_kind_check',
      sql`${table.kind} IN ('high_resistance', 'low_fuel', 'stale_telemetry')`,
    ),
  ],
);
