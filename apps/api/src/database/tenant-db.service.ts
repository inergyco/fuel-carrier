import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { TenantContext } from '@fuel-carrier/shared-types';
import { DATABASE } from './database.tokens';
import type { Database } from './database.types';
import type { TenantTransaction } from './tenant-db.types';

/**
 * Executes all tenant-scoped database work inside a transaction with
 * PostgreSQL session variables set via SET LOCAL (transaction-scoped).
 *
 * RLS policies read:
 *   - app.is_internal
 *   - app.current_company_id
 *
 * The API must connect with a role that does not have BYPASSRLS so policies apply.
 *
 * Never call db.select/insert/update/delete directly from services —
 * always route queries through tenantDb.run().
 */
@Injectable()
export class TenantDbService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async run<T>(
    context: TenantContext,
    callback: (tx: TenantTransaction) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(async (tx) => {
      await this._applyTenantContext(tx, context);
      return callback(tx);
    });
  }

  private async _applyTenantContext(
    tx: TenantTransaction,
    context: TenantContext,
  ): Promise<void> {
    // SET LOCAL via set_config(..., true) — values die with the transaction.
    await tx.execute(
      sql`SELECT set_config('app.is_internal', ${context.isInternal ? 'true' : 'false'}, true)`,
    );

    if (context.companyId) {
      await tx.execute(
        sql`SELECT set_config('app.current_company_id', ${context.companyId}, true)`,
      );
    }
  }
}
