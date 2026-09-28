import { HttpStatus, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import type {
  CompanyUser,
  PaginatedResult,
  PaginationParams,
  TenantContext,
} from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditActions,
  AuditEntityType,
} from '@fuel-carrier/shared-types';
import { hashPassword } from '../auth/password.utils';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  buildAuditContext,
  createAuditChanges,
  diffAuditChanges,
  fetchCompanyName,
  formatAuditPersonLabel,
  toAuditSnapshot,
} from '../audit-logs/audit-log.utils';
import { createApiException } from '../common/exceptions/api.exception';
import { resolveCompanyUserLevel } from '../common/company-user-level';
import {
  toPaginatedResult,
  getPaginationOffset,
} from '../common/pagination.utils';
import { assertUuidParam } from '../common/validation/uuid.utils';
import { companyUsers } from '../database/schema/company-users';
import { users } from '../database/schema/users';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';
import { rethrowPostgresError } from '../database/postgres-error.utils';
import {
  assertCompanyAccess,
  assertCompanyExists,
  assertNationalIdAvailable,
  assertNotRemovingLastAdmin,
  assertUsernameAvailable,
  COMPANY_USER_AUDIT_FIELDS,
  companyUserAuditRecord,
  findCompanyUserForContext,
  findLiveCompanyUserForContext,
  mapCompanyUser,
  type CompanyUserWithUser,
  type CreateCompanyUserPayload,
  type UpdateCompanyUserPayload,
} from './company-users.util';
import { COMPANY_USER_POSTGRES_MAPPINGS } from './company-users-postgres-mappings';

type ListCompanyUsersOptions = PaginationParams & {
  companyId: string;
};

@Injectable()
export class CompanyUsersService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async list(
    context: TenantContext,
    options: ListCompanyUsersOptions,
  ): Promise<PaginatedResult<CompanyUser>> {
    const { companyId, page, limit } = options;
    assertCompanyAccess(context, companyId);
    await assertCompanyExists(this.tenantDb, companyId);
    assertUuidParam(companyId, 'companyId');

    const offset = getPaginationOffset(options);
    const where = and(
      eq(companyUsers.companyId, companyId),
      isNull(companyUsers.deletedAt),
    );

    return this.tenantDb.run(context, async (tx) => {
      const [countRow] = await tx
        .select({ value: count() })
        .from(companyUsers)
        .where(where);

      const rows = await tx.query.companyUsers.findMany({
        where,
        with: { user: true },
        orderBy: desc(companyUsers.createdAt),
        limit,
        offset,
      });

      const items = rows
        .filter((row): row is CompanyUserWithUser => row.user != null)
        .map(mapCompanyUser);

      return toPaginatedResult({
        items,
        page,
        limit,
        totalItems: countRow?.value ?? 0,
      });
    });
  }

  async getById(context: TenantContext, id: string): Promise<CompanyUser> {
    assertUuidParam(id);

    return this.tenantDb.run(context, async (tx) => {
      const row = await findLiveCompanyUserForContext(tx, context, id);

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Company user not found',
        );
      }

      return mapCompanyUser(row);
    });
  }

  async create(
    context: TenantContext,
    dto: CreateCompanyUserPayload,
  ): Promise<CompanyUser> {
    assertCompanyAccess(context, dto.companyId);
    await assertCompanyExists(this.tenantDb, dto.companyId);

    const passwordHash = await hashPassword(dto.password);

    try {
      return await this.tenantDb.run(context, async (tx) => {
        await assertUsernameAvailable(tx, dto.username);
        await assertNationalIdAvailable(tx, dto.nationalId);

        const [user] = await tx
          .insert(users)
          .values({
            firstName: dto.firstName,
            lastName: dto.lastName,
          })
          .returning();

        const [row] = await tx
          .insert(companyUsers)
          .values({
            userId: user.id,
            companyId: dto.companyId,
            username: dto.username,
            nationalId: dto.nationalId ?? null,
            email: dto.email ?? null,
            passwordHash,
            level: dto.level,
          })
          .returning();

        if (!row || !user) {
          throw createApiException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ApiErrorCode.INTERNAL_ERROR,
            'Failed to create company user',
          );
        }

        const companyUser = mapCompanyUser({ ...row, user });
        await this._recordMutationAudit(tx, context, {
          action: AuditActions.COMPANY_USER_CREATED,
          companyUser,
          changes: createAuditChanges(
            companyUserAuditRecord(companyUser, true),
            COMPANY_USER_AUDIT_FIELDS,
          ),
        });

        return companyUser;
      });
    } catch (error) {
      rethrowPostgresError(error, COMPANY_USER_POSTGRES_MAPPINGS);
    }
  }

  async update(
    context: TenantContext,
    id: string,
    dto: UpdateCompanyUserPayload,
  ): Promise<CompanyUser> {
    try {
      return await this.tenantDb.run(context, async (tx) => {
        const existing = await findLiveCompanyUserForContext(tx, context, id);

        if (!existing) {
          throw createApiException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NOT_FOUND,
            'Company user not found',
          );
        }

        if (dto.username && dto.username !== existing.username) {
          await assertUsernameAvailable(tx, dto.username, id);
        }

        if (
          dto.nationalId !== undefined &&
          dto.nationalId !== existing.nationalId
        ) {
          await assertNationalIdAvailable(tx, dto.nationalId, id);
        }

        const existingLevel = resolveCompanyUserLevel(existing.level, 'admin');
        const nextLevel =
          dto.level !== undefined
            ? resolveCompanyUserLevel(dto.level, existingLevel)
            : existingLevel;
        await assertNotRemovingLastAdmin({
          tx,
          companyId: existing.companyId,
          currentLevel: existingLevel,
          nextLevel,
        });

        if (dto.firstName !== undefined || dto.lastName !== undefined) {
          await tx
            .update(users)
            .set({
              ...(dto.firstName !== undefined
                ? { firstName: dto.firstName }
                : {}),
              ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
            })
            .where(eq(users.id, existing.userId));
        }

        const passwordHash = dto.password
          ? await hashPassword(dto.password)
          : undefined;

        const [row] = await tx
          .update(companyUsers)
          .set({
            ...(dto.username !== undefined ? { username: dto.username } : {}),
            ...(dto.nationalId !== undefined
              ? { nationalId: dto.nationalId }
              : {}),
            ...(dto.email !== undefined ? { email: dto.email } : {}),
            ...(dto.level !== undefined ? { level: dto.level } : {}),
            ...(passwordHash ? { passwordHash, mustChangePassword: true } : {}),
          })
          .where(and(eq(companyUsers.id, id), isNull(companyUsers.deletedAt)))
          .returning();

        if (!row) {
          throw createApiException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NOT_FOUND,
            'Company user not found',
          );
        }

        const companyUser = mapCompanyUser({
          ...row,
          user: {
            ...existing.user,
            ...(dto.firstName !== undefined
              ? { firstName: dto.firstName }
              : {}),
            ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
          },
        });

        await this._recordMutationAudit(tx, context, {
          action: AuditActions.COMPANY_USER_UPDATED,
          companyUser,
          changes: diffAuditChanges(
            companyUserAuditRecord(mapCompanyUser(existing), false),
            companyUserAuditRecord(companyUser, Boolean(dto.password)),
            COMPANY_USER_AUDIT_FIELDS,
          ),
        });

        return companyUser;
      });
    } catch (error) {
      rethrowPostgresError(error, COMPANY_USER_POSTGRES_MAPPINGS);
    }
  }

  /** Soft-delete: set deletedAt, keep user profile and login row. */
  async delete(context: TenantContext, id: string): Promise<null> {
    return this.tenantDb.run(context, async (tx) => {
      const existing = await findCompanyUserForContext(tx, context, id);

      if (!existing) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Company user not found',
        );
      }

      if (existing.deletedAt) {
        return null;
      }

      await assertNotRemovingLastAdmin({
        tx,
        companyId: existing.companyId,
        currentLevel: resolveCompanyUserLevel(existing.level, 'admin'),
        nextLevel: null,
      });

      await tx
        .update(companyUsers)
        .set({ deletedAt: new Date() })
        .where(and(eq(companyUsers.id, id), isNull(companyUsers.deletedAt)));

      const deletedUser = mapCompanyUser(existing);
      const companyName = await fetchCompanyName(tx, existing.companyId);

      await this.auditLogService.record(context, {
        action: AuditActions.COMPANY_USER_DELETED,
        companyId: existing.companyId,
        entityType: AuditEntityType.COMPANY_USER,
        entityId: existing.id,
        metadata: {
          ...buildAuditContext({
            companyName,
            entityLabel: formatAuditPersonLabel(
              deletedUser.firstName,
              deletedUser.lastName,
              deletedUser.username,
            ),
          }),
          snapshot: toAuditSnapshot(
            companyUserAuditRecord(deletedUser, false),
            COMPANY_USER_AUDIT_FIELDS,
          ),
        },
      });

      return null;
    });
  }

  private async _recordMutationAudit(
    tx: TenantTransaction,
    context: TenantContext,
    options: {
      action: typeof AuditActions.COMPANY_USER_CREATED | typeof AuditActions.COMPANY_USER_UPDATED;
      companyUser: CompanyUser;
      changes: ReturnType<typeof createAuditChanges>;
    },
  ): Promise<void> {
    const { action, companyUser, changes } = options;
    const companyName = await fetchCompanyName(tx, companyUser.companyId);

    await this.auditLogService.record(context, {
      action,
      companyId: companyUser.companyId,
      entityType: AuditEntityType.COMPANY_USER,
      entityId: companyUser.id,
      metadata: {
        ...buildAuditContext({
          companyName,
          entityLabel: formatAuditPersonLabel(
            companyUser.firstName,
            companyUser.lastName,
            companyUser.username,
          ),
        }),
        changes,
      },
    });
  }
}
