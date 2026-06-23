import { HttpStatus, Injectable } from '@nestjs/common';
import { and, desc, eq, ne } from 'drizzle-orm';
import type { CompanyUser, TenantContext } from '@fuel-carrier/shared-types';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { hashPassword } from '../auth/password.utils';
import { createApiException } from '../common/exceptions/api.exception';
import { companies } from '../database/schema/companies';
import { companyUsers } from '../database/schema/company-users';
import { users } from '../database/schema/users';
import { internalTenantContext } from '../database/tenant-context.utils';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';

@Injectable()
export class CompanyUsersService {
  constructor(private readonly tenantDb: TenantDbService) {}

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

      return _mapCompanyUser(created);
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

      return _mapCompanyUser(updated);
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

      await tx.delete(users).where(eq(users.id, existing.userId));
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
  };
}

type CreateCompanyUserPayload = {
  companyId: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
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
