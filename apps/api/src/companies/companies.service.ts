import { HttpStatus, Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, ne, or } from 'drizzle-orm';
import type {
  Company,
  CompanyDeletionImpact,
  CompanyInput,
  PaginatedResult,
} from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditActions,
  AuditEntityType,
} from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import {
  toPaginatedResult,
  getPaginationOffset,
} from '../common/pagination.utils';
import { toIsoTimestamp } from '../common/iso-timestamp.utils';
import { toIlikeContainsPattern } from '../common/sql/ilike-pattern.utils';
import { assertUuidParam } from '../common/validation/uuid.utils';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  buildAuditContext,
  createAuditChanges,
  diffAuditChanges,
  toAuditSnapshot,
} from '../audit-logs/audit-log.utils';
import { internalTenantContext } from '../database/tenant-context.utils';
import type { ApiTenantContext } from '../database/tenant-context.types';
import { cars } from '../database/schema/cars';
import { companies } from '../database/schema/companies';
import { companyUsers } from '../database/schema/company-users';
import { drivers } from '../database/schema/drivers';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';
import { rethrowPostgresError } from '../database/postgres-error.utils';
import { COMPANY_POSTGRES_MAPPINGS } from './companies-postgres-mappings';

/**
 * Companies are not tenant-owned rows, but all database access still flows
 * through TenantDbService so the pattern is consistent across the codebase.
 */
@Injectable()
export class CompaniesService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async list(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginatedResult<Company>> {
    const { page, limit, search: searchText } = options;
    const offset = getPaginationOffset(options);
    const where = buildCompanySearchFilter(searchText);

    return this.tenantDb.run(internalTenantContext(), async (tx) => {
      const [countRow] = await tx
        .select({ value: count() })
        .from(companies)
        .where(where);

      const rows = await tx
        .select()
        .from(companies)
        .where(where)
        .orderBy(desc(companies.createdAt))
        .limit(limit)
        .offset(offset);

      return toPaginatedResult({
        items: rows.map(_mapCompany),
        page,
        limit,
        totalItems: countRow?.value ?? 0,
      });
    });
  }

  async getById(id: string): Promise<Company> {
    assertUuidParam(id);

    return this.tenantDb.run(internalTenantContext(), async (tx) => {
      const row = await _findCompanyById(tx, id);
      return _mapCompany(row);
    });
  }

  async getDeletionImpact(id: string): Promise<CompanyDeletionImpact> {
    assertUuidParam(id);

    return this.tenantDb.run(internalTenantContext(), async (tx) => {
      await _findCompanyById(tx, id);

      const [[carsRow], [driversRow], [usersRow]] = await Promise.all([
        tx.select({ value: count() }).from(cars).where(eq(cars.companyId, id)),
        tx
          .select({ value: count() })
          .from(drivers)
          .where(eq(drivers.companyId, id)),
        tx
          .select({ value: count() })
          .from(companyUsers)
          .where(eq(companyUsers.companyId, id)),
      ]);

      return {
        cars: carsRow?.value ?? 0,
        drivers: driversRow?.value ?? 0,
        users: usersRow?.value ?? 0,
      };
    });
  }

  async create(context: ApiTenantContext, dto: CompanyInput): Promise<Company> {
    try {
      return await this.tenantDb.run(context, async (tx) => {
        await this._assertNationalIdAvailable(tx, dto.nationalId);

        const [row] = await tx.insert(companies).values(dto).returning();
        const company = _mapCompany(row);

        await this.auditLogService.record(context, {
          tx,
          action: AuditActions.COMPANY_CREATED,
          companyId: company.id,
          entityType: AuditEntityType.COMPANY,
          entityId: company.id,
          metadata: {
            ...buildAuditContext({ companyName: company.name }),
            changes: createAuditChanges(company, COMPANY_AUDIT_FIELDS),
          },
        });

        return company;
      });
    } catch (error) {
      rethrowPostgresError(error, COMPANY_POSTGRES_MAPPINGS);
    }
  }

  async update(
    context: ApiTenantContext,
    id: string,
    dto: CompanyInput,
  ): Promise<Company> {
    try {
      return await this.tenantDb.run(context, async (tx) => {
        const existing = await _findCompanyById(tx, id);

        await this._assertNationalIdAvailable(tx, dto.nationalId, id);

        const [row] = await tx
          .update(companies)
          .set(dto)
          .where(eq(companies.id, id))
          .returning();

        const company = _mapCompany(row);

        await this.auditLogService.record(context, {
          tx,
          action: AuditActions.COMPANY_UPDATED,
          companyId: company.id,
          entityType: AuditEntityType.COMPANY,
          entityId: company.id,
          metadata: {
            ...buildAuditContext({ companyName: company.name }),
            changes: diffAuditChanges(
              _mapCompany(existing),
              company,
              COMPANY_AUDIT_FIELDS,
            ),
          },
        });

        return company;
      });
    } catch (error) {
      rethrowPostgresError(error, COMPANY_POSTGRES_MAPPINGS);
    }
  }

  async delete(context: ApiTenantContext, id: string): Promise<null> {
    return this.tenantDb.run(context, async (tx) => {
      const existing = await _findCompanyById(tx, id);

      // Record before delete on the same tx. A nested tenantDb.run after
      // delete deadlocks: the audit INSERT waits on the companies FK lock
      // held by this transaction, while we wait for the audit to finish.
      await this.auditLogService.record(context, {
        tx,
        action: AuditActions.COMPANY_DELETED,
        companyId: id,
        entityType: AuditEntityType.COMPANY,
        entityId: id,
        metadata: {
          ...buildAuditContext({ companyName: existing.name }),
          snapshot: toAuditSnapshot(
            _mapCompany(existing),
            COMPANY_AUDIT_FIELDS,
          ),
        },
      });

      await tx.delete(companies).where(eq(companies.id, id));

      return null;
    });
  }

  private async _assertNationalIdAvailable(
    tx: TenantTransaction,
    nationalId: string,
    excludeId?: string,
  ): Promise<void> {
    const whereClause = excludeId
      ? and(eq(companies.nationalId, nationalId), ne(companies.id, excludeId))
      : eq(companies.nationalId, nationalId);

    const [existing] = await tx
      .select({ id: companies.id })
      .from(companies)
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
            message: 'A company with this national ID already exists',
          },
        ],
      );
    }
  }
}

async function _findCompanyById(
  tx: TenantTransaction,
  id: string,
): Promise<typeof companies.$inferSelect> {
  const [row] = await tx
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);

  if (!row) {
    throw createApiException(
      HttpStatus.NOT_FOUND,
      ApiErrorCode.NOT_FOUND,
      'Company not found',
    );
  }

  return row;
}

function _mapCompany(row: typeof companies.$inferSelect): Company {
  return {
    id: row.id,
    name: row.name,
    nationalId: row.nationalId,
    phoneNumber: row.phoneNumber,
    address: row.address,
    note: row.note,
    logoUrl: row.logoUrl,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
  };
}

function buildCompanySearchFilter(searchText: string | undefined) {
  if (!searchText) {
    return undefined;
  }

  const pattern = toIlikeContainsPattern(searchText);

  return or(
    ilike(companies.name, pattern),
    ilike(companies.nationalId, pattern),
  );
}

const COMPANY_AUDIT_FIELDS = [
  'name',
  'nationalId',
  'phoneNumber',
  'address',
  'note',
  'logoUrl',
] as const satisfies readonly (keyof Company)[];
