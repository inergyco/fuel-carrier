import type { AuditLogMetadata } from '@fuel-carrier/shared-types';
import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').references(() => companies.id, {
    onDelete: 'set null',
  }),
  actorUserId: uuid('actor_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  actorRole: varchar('actor_role', { length: 32 }).notNull(),
  actorUsername: varchar('actor_username', { length: 32 }).notNull(),
  actorDisplayName: varchar('actor_display_name', { length: 201 }).notNull(),
  action: varchar('action', { length: 64 }).notNull(),
  entityType: varchar('entity_type', { length: 32 }),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata').$type<AuditLogMetadata>().notNull().default({}),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
