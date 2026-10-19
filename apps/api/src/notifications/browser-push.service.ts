import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import webpush from 'web-push';
import type {
  AuthSession,
  BrowserPushPayload,
  DeletePushSubscriptionDto,
  SavePushSubscriptionDto,
} from '@fuel-carrier/shared-types';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import type { Env } from '../config/env.schema';
import { companyUsers } from '../database/schema/company-users.schema';
import { notificationPushSubscriptions } from '../database/schema/notifications.schema';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';
import {
  internalTenantContext,
  tenantContextFromSession,
} from '../database/tenant-context.utils';

const PUSH_BATCH_SIZE = 25;
const PUSH_TTL_SECONDS = 24 * 60 * 60;
const PUSH_TIMEOUT_MS = 10_000;

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  authKey: string;
};

@Injectable()
export class BrowserPushService {
  private readonly logger = new Logger(BrowserPushService.name);
  private readonly vapidPublicKey: string;

  constructor(
    configService: ConfigService<Env, true>,
    private readonly tenantDb: TenantDbService,
  ) {
    const publicKey = configService.get('WEB_PUSH_VAPID_PUBLIC_KEY', {
      infer: true,
    });
    const privateKey = configService.get('WEB_PUSH_VAPID_PRIVATE_KEY', {
      infer: true,
    });
    const subject = configService.get('WEB_PUSH_VAPID_SUBJECT', {
      infer: true,
    });
    this.vapidPublicKey = publicKey;
    webpush.setVapidDetails(subject, publicKey, privateKey);
  }

  getPublicKey(): string {
    return this.vapidPublicKey;
  }

  async saveSubscription(
    session: AuthSession,
    input: SavePushSubscriptionDto,
  ): Promise<void> {
    const companyUser = await this.tenantDb.run(
      tenantContextFromSession(session),
      (tx) => requireSessionCompanyUser(tx, session),
    );

    await this.tenantDb.run(internalTenantContext(), async (tx) => {
      await tx
        .insert(notificationPushSubscriptions)
        .values({
          companyId: companyUser.companyId,
          companyUserId: companyUser.id,
          endpoint: input.endpoint,
          p256dh: input.keys.p256dh,
          authKey: input.keys.auth,
        })
        .onConflictDoUpdate({
          target: notificationPushSubscriptions.endpoint,
          set: {
            companyId: companyUser.companyId,
            companyUserId: companyUser.id,
            p256dh: input.keys.p256dh,
            authKey: input.keys.auth,
            updatedAt: new Date(),
          },
        });
    });
  }

  async removeSubscription(
    session: AuthSession,
    input: DeletePushSubscriptionDto,
  ): Promise<void> {
    const companyUser = await this.tenantDb.run(
      tenantContextFromSession(session),
      (tx) => requireSessionCompanyUser(tx, session),
    );

    await this.tenantDb.run(internalTenantContext(), async (tx) => {
      await tx
        .delete(notificationPushSubscriptions)
        .where(
          and(
            eq(notificationPushSubscriptions.endpoint, input.endpoint),
            eq(notificationPushSubscriptions.companyUserId, companyUser.id),
          ),
        );
    });
  }

  async deliver(input: {
    companyUserIds: string[];
    notificationId: string;
    title: string;
    body: string;
  }): Promise<void> {
    if (input.companyUserIds.length === 0) {
      return;
    }

    try {
      const subscriptions = await this._loadSubscriptions(input.companyUserIds);
      const payload = JSON.stringify({
        title: input.title,
        body: input.body,
        tag: input.notificationId,
      } satisfies BrowserPushPayload);
      const expiredIds: string[] = [];

      for (
        let offset = 0;
        offset < subscriptions.length;
        offset += PUSH_BATCH_SIZE
      ) {
        const batch = subscriptions.slice(offset, offset + PUSH_BATCH_SIZE);
        const results = await Promise.all(
          batch.map((subscription) => this._sendOne(subscription, payload)),
        );
        for (const id of results) {
          if (id) {
            expiredIds.push(id);
          }
        }
      }

      await this._deleteSubscriptions(expiredIds);
    } catch (error) {
      this.logger.error('Browser push delivery failed', error);
    }
  }

  private async _loadSubscriptions(
    companyUserIds: string[],
  ): Promise<PushSubscriptionRow[]> {
    return this.tenantDb.run(internalTenantContext(), async (tx) => {
      return tx
        .select({
          id: notificationPushSubscriptions.id,
          endpoint: notificationPushSubscriptions.endpoint,
          p256dh: notificationPushSubscriptions.p256dh,
          authKey: notificationPushSubscriptions.authKey,
        })
        .from(notificationPushSubscriptions)
        .where(
          inArray(notificationPushSubscriptions.companyUserId, companyUserIds),
        );
    });
  }

  private async _deleteSubscriptions(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await this.tenantDb.run(internalTenantContext(), async (tx) => {
      await tx
        .delete(notificationPushSubscriptions)
        .where(inArray(notificationPushSubscriptions.id, ids));
    });
  }

  private async _sendOne(
    subscription: PushSubscriptionRow,
    payload: string,
  ): Promise<string | null> {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.authKey,
          },
        },
        payload,
        { TTL: PUSH_TTL_SECONDS, timeout: PUSH_TIMEOUT_MS },
      );
      return null;
    } catch (error) {
      if (isExpiredPushSubscription(error)) {
        return subscription.id;
      }

      this.logger.warn(
        `Browser push failed for subscription ${subscription.id}`,
      );
      return null;
    }
  }
}

async function requireSessionCompanyUser(
  tx: TenantTransaction,
  session: AuthSession,
): Promise<{ id: string; companyId: string }> {
  if (!session.companyId) {
    throw createApiException(
      HttpStatus.FORBIDDEN,
      ApiErrorCode.FORBIDDEN,
      'Access denied',
    );
  }

  const [companyUser] = await tx
    .select({
      id: companyUsers.id,
      companyId: companyUsers.companyId,
    })
    .from(companyUsers)
    .where(
      and(
        eq(companyUsers.userId, session.userId),
        isNull(companyUsers.deletedAt),
      ),
    );

  if (!companyUser || companyUser.companyId !== session.companyId) {
    throw createApiException(
      HttpStatus.FORBIDDEN,
      ApiErrorCode.FORBIDDEN,
      'Access denied',
    );
  }

  return companyUser;
}

function isExpiredPushSubscription(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) {
    return false;
  }

  const statusCode = error.statusCode;
  return statusCode === HttpStatus.NOT_FOUND || statusCode === HttpStatus.GONE;
}
