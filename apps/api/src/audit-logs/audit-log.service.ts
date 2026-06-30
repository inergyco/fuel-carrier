import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';
import type {
  AuditAction,
  AuditActor,
  AuditEntityType,
  AuditLog,
  AuditLogMetadata,
  AuthSession,
  TenantContext,
} from '@fuel-carrier/shared-types';
import { ApiErrorCode, UserRole } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import type {
  PaginatedResult,
  PaginationParams,
} from '../common/types/pagination';
import { auditLogs } from '../database/schema/audit-logs';
import type { ApiTenantContext } from '../database/tenant-context.types';
import { getTenantContextActor } from '../database/tenant-context.utils';
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
    context: ApiTenantContext,
    input: RecordAuditLogInput,
  ): Promise<void> {
    try {
      const actor = this._resolveActor(
        input.actor,
        getTenantContextActor(context),
      );
      const metadata: AuditLogMetadata = {
        ...input.metadata,
      };

      if (!metadata.portal) {
        metadata.portal = this._inferPortal(actor.role);
      }

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
    pagination: PaginationParams,
  ): Promise<PaginatedResult<AuditLog>> {
    this._assertCompanyAccess(context, companyId);

    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    const where = eq(auditLogs.companyId, companyId);

    return this._listWhere(context, where, pagination, offset);
  }

  async listInternalActions(
    context: TenantContext,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<AuditLog>> {
    if (!context.isInternal) {
      throw createApiException(
        HttpStatus.FORBIDDEN,
        ApiErrorCode.FORBIDDEN,
        'Access denied',
      );
    }

    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    const where = eq(auditLogs.actorRole, UserRole.INTERNAL_ADMIN);

    return this._listWhere(context, where, pagination, offset);
  }

  private async _listWhere(
    context: TenantContext,
    where: ReturnType<typeof eq>,
    pagination: PaginationParams,
    offset: number,
  ): Promise<PaginatedResult<AuditLog>> {
    const { page, limit } = pagination;

    return this.tenantDb.run(context, async (tx) => {
      const [countRow] = await tx
        .select({ value: count() })
        .from(auditLogs)
        .where(where);

      const totalItems = countRow?.value ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));

      const rows = await tx
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        items: rows.map(_mapAuditLog),
        page,
        limit,
        totalItems,
        totalPages,
      };
    });
  }

  private _assertCompanyAccess(
    context: TenantContext,
    companyId: string,
  ): void {
    if (!context.isInternal && context.companyId !== companyId) {
      throw createApiException(
        HttpStatus.FORBIDDEN,
        ApiErrorCode.FORBIDDEN,
        'Access denied',
      );
    }
  }

  private _inferPortal(role: string): AuditLogMetadata['portal'] | undefined {
    if (role === UserRole.INTERNAL_ADMIN) {
      return 'internal';
    }

    if (role === UserRole.COMPANY_USER) {
      return 'external';
    }

    return undefined;
  }

  private _resolveActor(
    explicitActor?: AuditActor | AuthSession | null,
    contextActor?: AuthSession,
  ): {
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

    const fallbackActor = contextActor;

    if (fallbackActor) {
      const sessionActor = actorFromSession(fallbackActor);
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
