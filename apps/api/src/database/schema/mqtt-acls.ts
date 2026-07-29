import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { mqttClients } from './mqtt-clients';

/**
 * Topic ACL access for app code.
 * Mosquitto go-auth expects integers: read=1, write=2, readwrite=3.
 * Map in the broker ACL SQL with CASE … END.
 */
export const mqttAclAccessEnum = pgEnum('mqtt_acl_access', [
  'read',
  'write',
  'readwrite',
]);

export const mqttAcls = pgTable('mqtt_acls', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => mqttClients.id, { onDelete: 'cascade' }),
  topic: varchar('topic', { length: 256 }).notNull(),
  access: mqttAclAccessEnum('access').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Numeric values expected by mosquitto-go-auth ACL checks. */
export const MQTT_ACL_ACCESS_TO_RW = {
  read: 1,
  write: 2,
  readwrite: 3,
} as const;
