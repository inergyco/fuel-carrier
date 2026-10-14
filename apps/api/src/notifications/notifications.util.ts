import { HttpStatus } from '@nestjs/common';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import type {
  CompanyNotification,
  CompanyUserLevel,
  NotificationBroadcast,
  NotificationChannel,
  NotificationCompanySummary,
} from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  COMPANY_USER_LEVELS,
  NotificationChannels,
} from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import {
  toIsoTimestamp,
  toIsoTimestampOrNull,
} from '../common/iso-timestamp.utils';
import { companies } from '../database/schema/companies';
import { companyUsers } from '../database/schema/company-users';
import {
  notificationDeliveries,
  notifications,
} from '../database/schema/notifications';
import type { TenantTransaction } from '../database/tenant-db.types';

export type NotificationRow = typeof notifications.$inferSelect;

export type NotificationRecipient = {
  id: string;
  companyId: string;
};

export const inboxItemColumns = {
  id: notificationDeliveries.id,
  readAt: notificationDeliveries.readAt,
  channel: notifications.channel,
  title: notifications.title,
  body: notifications.body,
  createdAt: notifications.createdAt,
};

type InferColumnData<T> = T extends {
  _: { data: infer Data; notNull: infer NotNull };
}
  ? [NotNull] extends [true]
    ? Data
    : Data | null
  : never;

export type InboxItemRow = {
  [K in keyof typeof inboxItemColumns]: InferColumnData<
    (typeof inboxItemColumns)[K]
  >;
};

export const uniqueValues = <T>(values: readonly T[]): T[] => [
  ...new Set(values),
];

const toStoredLevels = (values: readonly string[]): CompanyUserLevel[] =>
  values.filter((value): value is CompanyUserLevel =>
    (COMPANY_USER_LEVELS as readonly string[]).includes(value),
  );

export const inboxWhere = (companyUserId: string) =>
  and(
    eq(notificationDeliveries.companyUserId, companyUserId),
    eq(notifications.channel, NotificationChannels.BROWSER),
  );

export function buildDeliveryRows(input: {
  notificationId: string;
  channel: NotificationChannel;
  recipients: NotificationRecipient[];
}) {
  switch (input.channel) {
    case NotificationChannels.BROWSER:
      return input.recipients.map((recipient) => ({
        notificationId: input.notificationId,
        companyId: recipient.companyId,
        companyUserId: recipient.id,
      }));
    default: {
      const unsupported: never = input.channel;
      return unsupported;
    }
  }
}

export async function loadCompanySummaries(
  tx: TenantTransaction,
  notificationIds: string[],
): Promise<Map<string, NotificationCompanySummary[]>> {
  const grouped = new Map<string, NotificationCompanySummary[]>();
  if (notificationIds.length === 0) {
    return grouped;
  }

  const rows = await tx
    .selectDistinct({
      notificationId: notificationDeliveries.notificationId,
      id: companies.id,
      name: companies.name,
    })
    .from(notificationDeliveries)
    .innerJoin(companies, eq(companies.id, notificationDeliveries.companyId))
    .where(inArray(notificationDeliveries.notificationId, notificationIds))
    .orderBy(asc(companies.name));

  for (const row of rows) {
    const current = grouped.get(row.notificationId) ?? [];
    current.push({ id: row.id, name: row.name });
    grouped.set(row.notificationId, current);
  }

  return grouped;
}

export async function requireCompanyUserId(
  tx: TenantTransaction,
  userId: string,
): Promise<string> {
  const [companyUser] = await tx
    .select({ id: companyUsers.id })
    .from(companyUsers)
    .where(
      and(eq(companyUsers.userId, userId), isNull(companyUsers.deletedAt)),
    );

  if (!companyUser) {
    throw createApiException(
      HttpStatus.FORBIDDEN,
      ApiErrorCode.FORBIDDEN,
      'Access denied',
    );
  }

  return companyUser.id;
}

export function toBroadcast(
  row: NotificationRow,
  companySummaries: NotificationCompanySummary[],
): NotificationBroadcast {
  return {
    id: row.id,
    channel: row.channel,
    title: row.title,
    body: row.body,
    levels: toStoredLevels(row.levels),
    companies: companySummaries,
    recipientCount: row.recipientCount,
    createdAt: toIsoTimestamp(row.createdAt),
  };
}

export function toCompanyNotification(row: InboxItemRow): CompanyNotification {
  return {
    id: row.id,
    channel: row.channel,
    title: row.title,
    body: row.body,
    readAt: toIsoTimestampOrNull(row.readAt),
    createdAt: toIsoTimestamp(row.createdAt),
  };
}
