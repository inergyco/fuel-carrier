import { HttpStatus } from '@nestjs/common';
import { and, eq, isNull, ne, sql } from 'drizzle-orm';
import type {
  CompanyUser,
  CompanyUserLevel,
  TenantContext,
} from '@fuel-carrier/shared-types';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import { toIsoTimestamp } from '../common/iso-timestamp.utils';
import { companies } from '../database/schema/companies';
import { companyUsers } from '../database/schema/company-users';
import { users } from '../database/schema/users';
import { internalTenantContext } from '../database/tenant-context.utils';
import type { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';

export type CreateCompanyUserPayload = {
  companyId: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  level: CompanyUserLevel;
  nationalId?: string | null;
  email?: string | null;
};

export type UpdateCompanyUserPayload = Partial<
  Omit<CreateCompanyUserPayload, 'companyId' | 'password'>
> & {
  password?: string;
};

export type CompanyUserWithUser = typeof companyUsers.$inferSelect & {
  user: typeof users.$inferSelect;
};

export const COMPANY_USER_AUDIT_FIELDS = [
  'firstName',
  'lastName',
  'username',
  'nationalId',
  'email',
  'level',
  'password',
] as const;

export function mapCompanyUser(row: CompanyUserWithUser): CompanyUser {
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
    deletedAt: row.deletedAt ? toIsoTimestamp(row.deletedAt) : null,
  };
}

export function companyUserAuditRecord(
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

export async function findCompanyUserById(
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

export async function findCompanyUserForContext(
  tx: TenantTransaction,
  context: TenantContext,
  id: string,
): Promise<CompanyUserWithUser | null> {
  const row = await findCompanyUserById(tx, id);

  if (!row) {
    return null;
  }

  if (!context.isInternal && row.companyId !== context.companyId) {
    return null;
  }

  return row;
}

export async function findLiveCompanyUserForContext(
  tx: TenantTransaction,
  context: TenantContext,
  id: string,
): Promise<CompanyUserWithUser | null> {
  const row = await findCompanyUserForContext(tx, context, id);

  if (!row || row.deletedAt) {
    return null;
  }

  return row;
}

export function assertCompanyAccess(
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

export async function assertCompanyExists(
  tenantDb: TenantDbService,
  companyId: string,
): Promise<void> {
  await tenantDb.run(internalTenantContext(), async (tx) => {
    const [company] = await tx
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.id, companyId), isNull(companies.deletedAt)))
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

export async function assertUsernameAvailable(
  tx: TenantTransaction,
  username: string,
  excludeId?: string,
): Promise<void> {
  const whereClause = excludeId
    ? and(
        eq(companyUsers.username, username),
        ne(companyUsers.id, excludeId),
        isNull(companyUsers.deletedAt),
      )
    : and(eq(companyUsers.username, username), isNull(companyUsers.deletedAt));

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

export async function assertNationalIdAvailable(
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
        isNull(companyUsers.deletedAt),
      )
    : and(
        eq(companyUsers.nationalId, nationalId),
        isNull(companyUsers.deletedAt),
      );

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

export async function assertNotRemovingLastAdmin(options: {
  tx: TenantTransaction;
  companyId: string;
  currentLevel: CompanyUserLevel;
  nextLevel: CompanyUserLevel | null;
}): Promise<void> {
  const { tx, companyId, currentLevel, nextLevel } = options;
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
        isNull(companyUsers.deletedAt),
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
