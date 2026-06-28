import { Injectable, Logger } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type {
  AuditAction,
  AuditActor,
  AuditEntityType,
  AuditLog,
  AuditLogMetadata,
  AuthSession,
  TenantContext,
} from '@fuel-carrier/shared-types';
import { auditLogs } from '../database/schema/audit-logs';
import { TenantDbService } from '../database/tenant-db.service';
import { actorFromSession } from './audit-log.utils';
import { AuditRequestContext } from './audit-request.context';

export type RecordAuditLogInput = {
  action: AuditAction;
  companyId?: string | null;
  entityType?: AuditEntityType | null;
  entityId?: string | null;
  metadata?: AuditLogMetadata;
  actor?: AuditActor | AuthSession | null;
};

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditRequestContext: AuditRequestContext,
  ) {}

  async record(
    context: TenantContext,
    input: RecordAuditLogInput,
  ): Promise<void> {
    try {
      const actor = this._resolveActor(input.actor);
      const metadata = input.metadata ?? {};

      await this.tenantDb.run(context, async (tx) => {
        await tx.insert(auditLogs).values({
          companyId: input.companyId ?? actor.companyId ?? null,
          actorUserId: actor.userId,
          actorRole: actor.role,
          actorUsername: actor.username,
          actorDisplayName: actor.displayName,
          action: input.action,
          entityType: input.entityType ?? null,
          entityId: input.entityId ?? null,
          metadata,
          ipAddress: this.auditRequestContext.getIpAddress(),
          userAgent: this.auditRequestContext.getUserAgent(),
        });
      });
    } catch (error) {
      this.logger.error(
        `Failed to record audit log for action ${input.action}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async listByCompany(
    context: TenantContext,
    companyId: string,
  ): Promise<AuditLog[]> {
    return this.tenantDb.run(context, async (tx) => {
      const rows = await tx
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.companyId, companyId))
        .orderBy(desc(auditLogs.createdAt));

      return rows.map(_mapAuditLog);
    });
  }

  private _resolveActor(explicitActor?: AuditActor | AuthSession | null): {
    userId: string | null;
    role: string;
    username: string;
    displayName: string;
    companyId: string | null | undefined;
  } {
    if (explicitActor) {
      if ('userId' in explicitActor && 'displayName' in explicitActor) {
        return {
          userId: explicitActor.userId,
          role: explicitActor.role,
          username: explicitActor.username,
          displayName: explicitActor.displayName,
          companyId: explicitActor.companyId,
        };
      }

      const sessionActor = actorFromSession(explicitActor);
      return {
        userId: sessionActor.userId,
        role: sessionActor.role,
        username: sessionActor.username,
        displayName: sessionActor.displayName,
        companyId: sessionActor.companyId,
      };
    }

    const requestActor = this.auditRequestContext.getActor();

    if (requestActor) {
      const sessionActor = actorFromSession(requestActor);
      return {
        userId: sessionActor.userId,
        role: sessionActor.role,
        username: sessionActor.username,
        displayName: sessionActor.displayName,
        companyId: sessionActor.companyId,
      };
    }

    return {
      userId: null,
      role: 'unknown',
      username: 'unknown',
      displayName: 'Unknown',
      companyId: null,
    };
  }
}

function _mapAuditLog(row: typeof auditLogs.$inferSelect): AuditLog {
  return row;
}
