import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { cars } from './cars';

/**
 * MQTT broker credentials (mosquitto-go-auth → Postgres).
 * Device usernames are typically the car UUID string; service accounts
 * (e.g. backend) leave car_id null.
 *
 * car_id is optional one-to-one: at most one MQTT client per car.
 */
export const mqttClients = pgTable('mqtt_clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 128 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  isSuperuser: boolean('is_superuser').notNull().default(false),
  carId: uuid('car_id')
    .unique()
    .references(() => cars.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
