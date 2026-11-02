import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { and, asc, count, desc, eq, inArray, isNull } from 'drizzle-orm';
import type {
  AuthSession,
  CompanyNotification,
  CompanyUserLevel,
  NotificationBroadcast,
  NotificationChannel,
  NotificationReadAllResult,
  NotificationUnreadCount,
  PaginatedResult,
  PaginationParams,
  SendNotificationDto,
} from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditActions,
  AuditEntityType,
  NOTIFICATION_COMPANIES_NOT_FOUND_MESSAGE,
  NOTIFICATION_NO_MATCHING_STAFF_MESSAGE,
  NotificationChannels,
} from '@fuel-carrier/shared-types';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { BrowserPushService } from './browser-push.service';
import { createApiException } from '../common/exceptions/api.exception';
import {
  getPaginationOffset,
  toPaginatedResult,
} from '../common/pagination.utils';
import { assertUuidParam } from '../common/validation/uuid.utils';
import { companies } from '../database/schema/companies.schema';
import { companyUsers } from '../database/schema/company-users.schema';
import {
  notificationDeliveries,
  notifications,
} from '../database/schema/notifications.schema';
import type { ApiTenantContext } from '../database/tenant-context.types';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';
import {
  internalTenantContext,
  tenantContextFromSession,
} from '../database/tenant-context.utils';
import {
  buildDeliveryRows,
  inboxItemColumns,
  inboxWhere,
  loadCompanySummaries,
  requireCompanyUserId,
  toBroadcast,
  toCompanyNotification,
  uniqueValues,
} from './notifications.util';

export type DeliverAutomatedBrowserInput = {
  companyId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  /** Plain-text title for OS browser push when the inbox uses a plate component. */
  pushTitle?: string;
  carId?: string | null;
  licensePlate?: string | null;
  levels: CompanyUserLevel[];
  /**
   * Runs in the same transaction as the notification insert. Use this to
   * claim related open-alert rows so a unique violation rolls the message back.
   */
  afterInsert?: (
    tx: TenantTransaction,
    notificationId: string,
  ) => Promise<void>;
};

export type DeliverAutomatedBrowserResult = {
  notificationId: string;
  recipientIds: string[];
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditLogService: AuditLogService,
    private readonly browserPush: BrowserPushService,
  ) {}

  async send(
    context: ApiTenantContext,
    input: SendNotificationDto,
  ): Promise<NotificationBroadcast> {
    const companyIds = uniqueValues(input.companyIds);
    const levels = uniqueValues(input.levels);

    const sent = await this.tenantDb.run(context, async (tx) => {
      const companyRows = await tx
        .select({ id: companies.id, name: companies.name })
        .from(companies)
        .where(
          and(inArray(companies.id, companyIds), isNull(companies.deletedAt)),
        )
        .orderBy(asc(companies.name));

      if (companyRows.length !== companyIds.length) {
        throw createApiException(
          HttpStatus.BAD_REQUEST,
          ApiErrorCode.VALIDATION_ERROR,
          'Validation failed',
          [
            {
              field: 'companyIds',
              message: NOTIFICATION_COMPANIES_NOT_FOUND_MESSAGE,
            },
          ],
        );
      }

      const recipients = await tx
        .select({
          id: companyUsers.id,
          companyId: companyUsers.companyId,
        })
        .from(companyUsers)
        .where(
          and(
            inArray(companyUsers.companyId, companyIds),
            inArray(companyUsers.level, levels),
            isNull(companyUsers.deletedAt),
          ),
        );

      const companiesWithStaff = new Set(
        recipients.map((recipient) => recipient.companyId),
      );
      const missingCompanies = companyRows.filter(
        (company) => !companiesWithStaff.has(company.id),
      );
      if (missingCompanies.length > 0) {
        throw createApiException(
          HttpStatus.BAD_REQUEST,
          ApiErrorCode.VALIDATION_ERROR,
          'Validation failed',
          missingCompanies.map((company) => ({
            field: 'companyIds',
            message: `${NOTIFICATION_NO_MATCHING_STAFF_MESSAGE}:${company.name}`,
          })),
        );
      }

      const [created] = await tx
        .insert(notifications)
        .values({
          channel: input.channel,
          title: input.title,
          body: input.body,
          levels,
          recipientCount: recipients.length,
          createdByUserId: context.actor?.userId ?? null,
        })
        .returning();

      if (!created) {
        throw createApiException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ApiErrorCode.INTERNAL_ERROR,
          'Could not save the notification',
        );
      }

      await tx.insert(notificationDeliveries).values(
        buildDeliveryRows({
          notificationId: created.id,
          channel: input.channel,
          recipients,
        }),
      );

      await this.auditLogService.record(context, {
        tx,
        action: AuditActions.NOTIFICATION_SENT,
        entityType: AuditEntityType.NOTIFICATION,
        entityId: created.id,
        metadata: {
          entityLabel: input.title,
          snapshot: {
            channel: input.channel,
            title: input.title,
            level: levels.join(', '),
            recipientCount: recipients.length,
            companyCount: companyIds.length,
          },
        },
      });

      return {
        broadcast: toBroadcast(created, companyRows),
        recipientIds: recipients.map((recipient) => recipient.id),
      };
    });

    if (input.channel === NotificationChannels.BROWSER) {
      await this.browserPush.deliver({
        companyUserIds: sent.recipientIds,
        notificationId: sent.broadcast.id,
        title: input.title,
        body: input.body,
      });
    }

    return sent.broadcast;
  }

  /**
   * System-authored browser message for one company. Returns null when there
   * are no matching staff or the message could not be saved — callers must
   * not treat that as a request failure.
   */
  async deliverAutomatedBrowser(
    input: DeliverAutomatedBrowserInput,
  ): Promise<DeliverAutomatedBrowserResult | null> {
    const levels = uniqueValues(input.levels);
    const context = internalTenantContext();

    const sent = await this.tenantDb.run(context, async (tx) => {
      const recipients = await tx
        .select({
          id: companyUsers.id,
          companyId: companyUsers.companyId,
        })
        .from(companyUsers)
        .where(
          and(
            eq(companyUsers.companyId, input.companyId),
            inArray(companyUsers.level, levels),
            isNull(companyUsers.deletedAt),
          ),
        );

      if (recipients.length === 0) {
        return null;
      }

      const [created] = await tx
        .insert(notifications)
        .values({
          channel: input.channel,
          title: input.title,
          body: input.body,
          carId: input.carId ?? null,
          licensePlate: input.licensePlate ?? null,
          levels,
          recipientCount: recipients.length,
          createdByUserId: null,
        })
        .returning({ id: notifications.id });

      if (!created) {
        this.logger.warn(
          `Could not save automated notification for company ${input.companyId}`,
        );
        return null;
      }

      await tx.insert(notificationDeliveries).values(
        buildDeliveryRows({
          notificationId: created.id,
          channel: input.channel,
          recipients,
        }),
      );

      if (input.afterInsert) {
        await input.afterInsert(tx, created.id);
      }

      return {
        notificationId: created.id,
        recipientIds: recipients.map((recipient) => recipient.id),
      };
    });

    if (!sent) {
      return null;
    }

    if (input.channel === NotificationChannels.BROWSER) {
      await this.browserPush.deliver({
        companyUserIds: sent.recipientIds,
        notificationId: sent.notificationId,
        title: input.pushTitle ?? input.title,
        body: input.body,
      });
    }

    return sent;
  }

  async list(
    context: ApiTenantContext,
    query: PaginationParams,
  ): Promise<PaginatedResult<NotificationBroadcast>> {
    return this.listBroadcasts(context, query);
  }

  async listByCompany(
    context: ApiTenantContext,
    companyId: string,
    query: PaginationParams,
  ): Promise<PaginatedResult<NotificationBroadcast>> {
    assertUuidParam(companyId, 'companyId');
    return this.listBroadcasts(context, query, companyId);
  }

  private async listBroadcasts(
    context: ApiTenantContext,
    query: PaginationParams,
    companyId?: string,
  ): Promise<PaginatedResult<NotificationBroadcast>> {
    const { page, limit } = query;
    const offset = getPaginationOffset(query);

    return this.tenantDb.run(context, async (tx) => {
      const deliveredToCompany =
        companyId == null
          ? undefined
          : inArray(
              notifications.id,
              tx
                .select({ id: notificationDeliveries.notificationId })
                .from(notificationDeliveries)
                .where(eq(notificationDeliveries.companyId, companyId)),
            );
      const [countRow] = await tx
        .select({ value: count() })
        .from(notifications)
        .where(deliveredToCompany);

      const rows = await tx
        .select()
        .from(notifications)
        .where(deliveredToCompany)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      const companiesByNotification = await loadCompanySummaries(
        tx,
        rows.map((row) => row.id),
      );

      return toPaginatedResult({
        items: rows.map((row) =>
          toBroadcast(row, companiesByNotification.get(row.id) ?? []),
        ),
        page,
        limit,
        totalItems: countRow?.value ?? 0,
      });
    });
  }

  async listInbox(
    session: AuthSession,
    query: PaginationParams,
  ): Promise<PaginatedResult<CompanyNotification>> {
    const context = tenantContextFromSession(session);
    const { page, limit } = query;
    const offset = getPaginationOffset(query);

    return this.tenantDb.run(context, async (tx) => {
      const companyUserId = await requireCompanyUserId(tx, session.userId);
      const where = inboxWhere(companyUserId);
      const [countRow] = await tx
        .select({ value: count() })
        .from(notificationDeliveries)
        .innerJoin(
          notifications,
          eq(notifications.id, notificationDeliveries.notificationId),
        )
        .where(where);

      const rows = await tx
        .select(inboxItemColumns)
        .from(notificationDeliveries)
        .innerJoin(
          notifications,
          eq(notifications.id, notificationDeliveries.notificationId),
        )
        .where(where)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      return toPaginatedResult({
        items: rows.map(toCompanyNotification),
        page,
        limit,
        totalItems: countRow?.value ?? 0,
      });
    });
  }

  async unreadCount(session: AuthSession): Promise<NotificationUnreadCount> {
    const context = tenantContextFromSession(session);

    return this.tenantDb.run(context, async (tx) => {
      const companyUserId = await requireCompanyUserId(tx, session.userId);
      const [countRow] = await tx
        .select({ value: count() })
        .from(notificationDeliveries)
        .innerJoin(
          notifications,
          eq(notifications.id, notificationDeliveries.notificationId),
        )
        .where(
          and(inboxWhere(companyUserId), isNull(notificationDeliveries.readAt)),
        );

      return { count: countRow?.value ?? 0 };
    });
  }

  async markRead(
    session: AuthSession,
    deliveryId: string,
  ): Promise<CompanyNotification> {
    assertUuidParam(deliveryId);
    const context = tenantContextFromSession(session);

    return this.tenantDb.run(context, async (tx) => {
      const companyUserId = await requireCompanyUserId(tx, session.userId);
      const [existing] = await tx
        .select(inboxItemColumns)
        .from(notificationDeliveries)
        .innerJoin(
          notifications,
          eq(notifications.id, notificationDeliveries.notificationId),
        )
        .where(
          and(
            eq(notificationDeliveries.id, deliveryId),
            inboxWhere(companyUserId),
          ),
        );

      if (!existing) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Notification not found',
        );
      }

      if (existing.readAt) {
        return toCompanyNotification(existing);
      }

      const readAt = new Date();
      await tx
        .update(notificationDeliveries)
        .set({ readAt })
        .where(eq(notificationDeliveries.id, existing.id));

      return toCompanyNotification({ ...existing, readAt });
    });
  }

  async markAllRead(session: AuthSession): Promise<NotificationReadAllResult> {
    const context = tenantContextFromSession(session);

    return this.tenantDb.run(context, async (tx) => {
      const companyUserId = await requireCompanyUserId(tx, session.userId);
      const updated = await tx
        .update(notificationDeliveries)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notificationDeliveries.companyUserId, companyUserId),
            isNull(notificationDeliveries.readAt),
            inArray(
              notificationDeliveries.notificationId,
              tx
                .select({ id: notifications.id })
                .from(notifications)
                .where(eq(notifications.channel, NotificationChannels.BROWSER)),
            ),
          ),
        )
        .returning({ id: notificationDeliveries.id });

      return { updatedCount: updated.length };
    });
  }
}
