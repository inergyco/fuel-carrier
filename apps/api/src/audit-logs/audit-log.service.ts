import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { and, count, desc, eq, gte, lte, type SQL } from 'drizzle-orm';
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
import { toIsoTimestamp } from '../common/iso-timestamp.utils';
import type {
  PaginatedResult,
  PaginationParams,
} from '../common/types/pagination';
import { auditLogs } from '../database/schema/audit-logs';
import type { ApiTenantContext } from '../database/tenant-context.types';
import { getTenantContextActor } from '../database/tenant-context.utils';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';
import { buildAuditLogSearchFilter } from './audit-logs-list-filters';
import { actorFromSession } from './audit-log.utils';
import { AuditRequestContext } from './audit-request.context';

export type AuditLogListQuery = PaginationParams & {
  search?: string;
  start?: Date;
  end?: Date;
};

export type RecordAuditLogInput = {
  action: AuditAction;
  companyId?: string | null;
  entityType?: AuditEntityType | null;
  entityId?: string | null;
  metadata?: AuditLogMetadata;
  actor?: AuditActor | AuthSession | null;
  /**
   * When recording inside an open `tenantDb.run` callback, pass that `tx`.
   * Otherwise a nested `tenantDb.run` opens a second connection and can
   * deadlock on FKs to rows locked by the outer transaction (e.g. company
   * create/delete).
   */
  tx?: TenantTransaction;
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

      const values = {
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
      };

      if (input.tx) {
        await input.tx.insert(auditLogs).values(values);
        return;
      }

      await this.tenantDb.run(context, async (tx) => {
        await tx.insert(auditLogs).values(values);
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
    query: AuditLogListQuery,
  ): Promise<PaginatedResult<AuditLog>> {
    this._assertCompanyAccess(context, companyId);

    const { page, limit } = query;
    const offset = (page - 1) * limit;
    const where = and(
      eq(auditLogs.companyId, companyId),
      buildCreatedAtRangeFilter(query),
      buildAuditLogSearchFilter(query.search),
    );

    return this._listWhere(context, { where, query, offset });
  }

  async listInternalActions(
    context: TenantContext,
    query: AuditLogListQuery,
  ): Promise<PaginatedResult<AuditLog>> {
    if (!context.isInternal) {
      throw createApiException(
        HttpStatus.FORBIDDEN,
        ApiErrorCode.FORBIDDEN,
        'Access denied',
      );
    }

    const { page, limit } = query;
    const offset = (page - 1) * limit;
    const where = and(
      eq(auditLogs.actorRole, UserRole.INTERNAL_ADMIN),
      buildCreatedAtRangeFilter(query),
      buildAuditLogSearchFilter(query.search),
    );

    return this._listWhere(context, { where, query, offset });
  }

  private async _listWhere(
    context: TenantContext,
    options: {
      where: SQL | undefined;
      query: PaginationParams;
      offset: number;
    },
  ): Promise<PaginatedResult<AuditLog>> {
    const { where, query, offset } = options;
    const { page, limit } = query;

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

function buildCreatedAtRangeFilter(query: {
  start?: Date;
  end?: Date;
}): SQL | undefined {
  return and(
    query.start ? gte(auditLogs.createdAt, query.start) : undefined,
    query.end ? lte(auditLogs.createdAt, query.end) : undefined,
  );
}

function _mapAuditLog(row: typeof auditLogs.$inferSelect): AuditLog {
  return {
    ...row,
    createdAt: toIsoTimestamp(row.createdAt),
  };
}
