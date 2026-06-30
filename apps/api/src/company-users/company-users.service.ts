import { HttpStatus, Injectable } from '@nestjs/common';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import type {
  CompanyUser,
  CompanyUserLevel,
  TenantContext,
} from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditAction,
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
import { companies } from '../database/schema/companies';
import { companyUsers } from '../database/schema/company-users';
import { users } from '../database/schema/users';
import { internalTenantContext } from '../database/tenant-context.utils';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';

@Injectable()
export class CompanyUsersService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async list(
    context: TenantContext,
    companyId: string,
  ): Promise<CompanyUser[]> {
    this._assertCompanyAccess(context, companyId);
    await this._assertCompanyExists(companyId);

    return this.tenantDb.run(context, async (tx) => {
      const rows = await _findCompanyUsersByCompanyId(tx, companyId);
      return rows.map(_mapCompanyUser);
    });
  }

  async getById(context: TenantContext, id: string): Promise<CompanyUser> {
    return this.tenantDb.run(context, async (tx) => {
      const row = await _findCompanyUserForContext(tx, context, id);

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Company user not found',
        );
      }

      return _mapCompanyUser(row);
    });
  }

  async create(
    context: TenantContext,
    dto: CreateCompanyUserPayload,
  ): Promise<CompanyUser> {
    this._assertCompanyAccess(context, dto.companyId);
    await this._assertCompanyExists(dto.companyId);

    const passwordHash = await hashPassword(dto.password);

    return this.tenantDb.run(context, async (tx) => {
      await this._assertUsernameAvailable(tx, dto.username);
      await this._assertNationalIdAvailable(tx, dto.nationalId);

      const [user] = await tx
        .insert(users)
        .values({
          firstName: dto.firstName,
          lastName: dto.lastName,
        })
        .returning({ id: users.id });

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

      const created = await _findCompanyUserById(tx, row.id);

      if (!created) {
        throw createApiException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ApiErrorCode.INTERNAL_ERROR,
          'Failed to create company user',
        );
      }

      const companyUser = _mapCompanyUser(created);
      const companyName = await fetchCompanyName(tx, companyUser.companyId);

      await this.auditLogService.record(context, {
        action: AuditAction.COMPANY_USER_CREATED,
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
          changes: createAuditChanges(
            _companyUserAuditRecord(companyUser, true),
            COMPANY_USER_AUDIT_FIELDS,
          ),
        },
      });

      return companyUser;
    });
  }

  async update(
    context: TenantContext,
    id: string,
    dto: UpdateCompanyUserPayload,
  ): Promise<CompanyUser> {
    return this.tenantDb.run(context, async (tx) => {
      const existing = await _findCompanyUserForContext(tx, context, id);

      if (!existing) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Company user not found',
        );
      }

      if (dto.username && dto.username !== existing.username) {
        await this._assertUsernameAvailable(tx, dto.username, id);
      }

      if (
        dto.nationalId !== undefined &&
        dto.nationalId !== existing.nationalId
      ) {
        await this._assertNationalIdAvailable(tx, dto.nationalId, id);
      }

      const existingLevel = resolveCompanyUserLevel(existing.level, 'admin');
      const nextLevel =
        dto.level !== undefined
          ? resolveCompanyUserLevel(dto.level, existingLevel)
          : existingLevel;
      await this._assertNotRemovingLastAdmin(
        tx,
        existing.companyId,
        existing.id,
        existingLevel,
        nextLevel,
      );

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

      await tx
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
        .where(eq(companyUsers.id, id));

      const updated = await _findCompanyUserById(tx, id);

      if (!updated) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Company user not found',
        );
      }

      const companyUser = _mapCompanyUser(updated);
      const companyName = await fetchCompanyName(tx, companyUser.companyId);

      await this.auditLogService.record(context, {
        action: AuditAction.COMPANY_USER_UPDATED,
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
          changes: diffAuditChanges(
            _companyUserAuditRecord(_mapCompanyUser(existing), false),
            _companyUserAuditRecord(companyUser, Boolean(dto.password)),
            COMPANY_USER_AUDIT_FIELDS,
          ),
        },
      });

      return companyUser;
    });
  }

  async delete(context: TenantContext, id: string): Promise<null> {
    return this.tenantDb.run(context, async (tx) => {
      const existing = await _findCompanyUserForContext(tx, context, id);

      if (!existing) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Company user not found',
        );
      }

      await this._assertNotRemovingLastAdmin(
        tx,
        existing.companyId,
        existing.id,
        resolveCompanyUserLevel(existing.level, 'admin'),
        null,
      );

      await tx.delete(users).where(eq(users.id, existing.userId));

      const deletedUser = _mapCompanyUser(existing);
      const companyName = await fetchCompanyName(tx, existing.companyId);

      await this.auditLogService.record(context, {
        action: AuditAction.COMPANY_USER_DELETED,
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
            _companyUserAuditRecord(deletedUser, false),
            COMPANY_USER_AUDIT_FIELDS,
          ),
        },
      });

      return null;
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

  private async _assertCompanyExists(companyId: string): Promise<void> {
    await this.tenantDb.run(internalTenantContext(), async (tx) => {
      const [company] = await tx
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);

      if (!company) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Company not found',
        );
      }
    });
  }

  private async _assertUsernameAvailable(
    tx: TenantTransaction,
    username: string,
    excludeId?: string,
  ): Promise<void> {
    const whereClause = excludeId
      ? and(eq(companyUsers.username, username), ne(companyUsers.id, excludeId))
      : eq(companyUsers.username, username);

    const [existing] = await tx
      .select({ id: companyUsers.id })
      .from(companyUsers)
      .where(whereClause)
      .limit(1);

    if (existing) {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        'Validation failed',
        [{ field: 'username', message: 'This username is already taken' }],
      );
    }
  }

  private async _assertNationalIdAvailable(
    tx: TenantTransaction,
    nationalId?: string | null,
    excludeId?: string,
  ): Promise<void> {
    if (!nationalId) {
      return;
    }

    const whereClause = excludeId
      ? and(
          eq(companyUsers.nationalId, nationalId),
          ne(companyUsers.id, excludeId),
        )
      : eq(companyUsers.nationalId, nationalId);

    const [existing] = await tx
      .select({ id: companyUsers.id })
      .from(companyUsers)
      .where(whereClause)
      .limit(1);

    if (existing) {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        'Validation failed',
        [
          {
            field: 'nationalId',
            message: 'A user with this national ID already exists',
          },
        ],
      );
    }
  }

  private async _assertNotRemovingLastAdmin(
    tx: TenantTransaction,
    companyId: string,
    _targetId: string,
    currentLevel: CompanyUserLevel,
    nextLevel: CompanyUserLevel | null,
  ): Promise<void> {
    const isCurrentlyAdmin = currentLevel === 'admin';
    const willRemainAdmin = nextLevel === 'admin';

    if (!isCurrentlyAdmin || willRemainAdmin) {
      return;
    }

    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          eq(companyUsers.level, 'admin'),
        ),
      );

    if (count <= 1) {
      throw createApiException(
        HttpStatus.FORBIDDEN,
        ApiErrorCode.FORBIDDEN,
        'Cannot remove the last company admin',
      );
    }
  }
}

async function _findCompanyUsersByCompanyId(
  tx: TenantTransaction,
  companyId: string,
): Promise<CompanyUserWithUser[]> {
  const rows = await tx.query.companyUsers.findMany({
    where: eq(companyUsers.companyId, companyId),
    with: { user: true },
    orderBy: desc(companyUsers.createdAt),
  });

  return rows.filter((row): row is CompanyUserWithUser => row.user != null);
}

async function _findCompanyUserById(
  tx: TenantTransaction,
  id: string,
): Promise<CompanyUserWithUser | null> {
  const row = await tx.query.companyUsers.findFirst({
    where: eq(companyUsers.id, id),
    with: { user: true },
  });

  if (!row?.user) {
    return null;
  }

  return row;
}

async function _findCompanyUserForContext(
  tx: TenantTransaction,
  context: TenantContext,
  id: string,
): Promise<CompanyUserWithUser | null> {
  const row = await _findCompanyUserById(tx, id);

  if (!row) {
    return null;
  }

  if (!context.isInternal && row.companyId !== context.companyId) {
    return null;
  }

  return row;
}

function _mapCompanyUser(row: CompanyUserWithUser): CompanyUser {
  return {
    id: row.id,
    userId: row.userId,
    companyId: row.companyId,
    username: row.username,
    firstName: row.user.firstName,
    lastName: row.user.lastName,
    nationalId: row.nationalId,
    email: row.email,
    level: row.level,
  };
}

type CreateCompanyUserPayload = {
  companyId: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  level: CompanyUserLevel;
  nationalId?: string | null;
  email?: string | null;
};

type UpdateCompanyUserPayload = Partial<
  Omit<CreateCompanyUserPayload, 'companyId' | 'password'>
> & {
  password?: string;
};

type CompanyUserWithUser = typeof companyUsers.$inferSelect & {
  user: typeof users.$inferSelect;
};

const COMPANY_USER_AUDIT_FIELDS = [
  'firstName',
  'lastName',
  'username',
  'nationalId',
  'email',
  'level',
  'password',
] as const;

function _companyUserAuditRecord(
  user: CompanyUser,
  passwordChanged: boolean,
): Record<string, unknown> {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    nationalId: user.nationalId,
    email: user.email,
    level: user.level,
    password: passwordChanged ? 'changed' : null,
  };
}
