import { HttpStatus, Injectable } from '@nestjs/common';
import { and, desc, eq, ne } from 'drizzle-orm';
import type { Company, CompanyInput } from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditAction,
  AuditEntityType,
} from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  createAuditChanges,
  diffAuditChanges,
  toAuditSnapshot,
} from '../audit-logs/audit-log.utils';
import { internalTenantContext } from '../database/tenant-context.utils';
import { companies } from '../database/schema/companies';
import { TenantDbService } from '../database/tenant-db.service';
import type { TenantTransaction } from '../database/tenant-db.types';

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

  async list(): Promise<Company[]> {
    return this.tenantDb.run(internalTenantContext(), async (tx) => {
      const rows = await tx
        .select()
        .from(companies)
        .orderBy(desc(companies.createdAt));

      return rows.map(_mapCompany);
    });
  }

  async getById(id: string): Promise<Company> {
    return this.tenantDb.run(internalTenantContext(), async (tx) => {
      const row = await _findCompanyById(tx, id);
      return _mapCompany(row);
    });
  }

  async create(dto: CompanyInput): Promise<Company> {
    return this.tenantDb.run(internalTenantContext(), async (tx) => {
      await this._assertNationalIdAvailable(tx, dto.nationalId);

      const [row] = await tx.insert(companies).values(dto).returning();
      const company = _mapCompany(row);

      await this.auditLogService.record(internalTenantContext(), {
        action: AuditAction.COMPANY_CREATED,
        companyId: company.id,
        entityType: AuditEntityType.COMPANY,
        entityId: company.id,
        metadata: {
          changes: createAuditChanges(company, COMPANY_AUDIT_FIELDS),
        },
      });

      return company;
    });
  }

  async update(id: string, dto: CompanyInput): Promise<Company> {
    return this.tenantDb.run(internalTenantContext(), async (tx) => {
      const existing = await _findCompanyById(tx, id);

      await this._assertNationalIdAvailable(tx, dto.nationalId, id);

      const [row] = await tx
        .update(companies)
        .set(dto)
        .where(eq(companies.id, id))
        .returning();

      const company = _mapCompany(row);

      await this.auditLogService.record(internalTenantContext(), {
        action: AuditAction.COMPANY_UPDATED,
        companyId: company.id,
        entityType: AuditEntityType.COMPANY,
        entityId: company.id,
        metadata: {
          changes: diffAuditChanges(
            _mapCompany(existing),
            company,
            COMPANY_AUDIT_FIELDS,
          ),
        },
      });

      return company;
    });
  }

  async delete(id: string): Promise<null> {
    return this.tenantDb.run(internalTenantContext(), async (tx) => {
      const existing = await _findCompanyById(tx, id);

      await tx.delete(companies).where(eq(companies.id, id));

      await this.auditLogService.record(internalTenantContext(), {
        action: AuditAction.COMPANY_DELETED,
        companyId: id,
        entityType: AuditEntityType.COMPANY,
        entityId: id,
        metadata: {
          snapshot: toAuditSnapshot(
            _mapCompany(existing),
            COMPANY_AUDIT_FIELDS,
          ),
        },
      });

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
  return row;
}

const COMPANY_AUDIT_FIELDS = [
  'name',
  'nationalId',
  'phoneNumber',
  'address',
  'note',
  'logoUrl',
] as const satisfies readonly (keyof Company)[];
