import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, ne } from 'drizzle-orm';
import type { Company, CompanyInput } from '@fuel-carrier/shared-types';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import { DATABASE } from '../database/database.tokens';
import type { Database } from '../database/database.types';
import { companies } from '../database/schema/companies';

@Injectable()
export class CompaniesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Company[]> {
    const rows = await this.db
      .select()
      .from(companies)
      .orderBy(desc(companies.createdAt));

    return rows.map(_mapCompany);
  }

  async create(dto: CompanyInput): Promise<Company> {
    await this._assertNationalIdAvailable(dto.nationalId);

    const [row] = await this.db.insert(companies).values(dto).returning();

    return _mapCompany(row);
  }

  async update(id: string, dto: CompanyInput): Promise<Company> {
    await this._assertNationalIdAvailable(dto.nationalId, id);

    const [row] = await this.db
      .update(companies)
      .set(dto)
      .where(eq(companies.id, id))
      .returning();

    if (!row) {
      throw createApiException(
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
        'Company not found',
      );
    }

    return _mapCompany(row);
  }

  async delete(id: string): Promise<null> {
    const [row] = await this.db
      .delete(companies)
      .where(eq(companies.id, id))
      .returning({ id: companies.id });

    if (!row) {
      throw createApiException(
        HttpStatus.NOT_FOUND,
        ApiErrorCode.NOT_FOUND,
        'Company not found',
      );
    }

    return null;
  }

  private async _assertNationalIdAvailable(
    nationalId: string,
    excludeId?: string,
  ): Promise<void> {
    const whereClause = excludeId
      ? and(eq(companies.nationalId, nationalId), ne(companies.id, excludeId))
      : eq(companies.nationalId, nationalId);

    const [existing] = await this.db
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

function _mapCompany(row: typeof companies.$inferSelect): Company {
  return row;
}
