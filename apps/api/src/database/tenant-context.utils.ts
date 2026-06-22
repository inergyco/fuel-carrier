import type { AuthSession, TenantContext } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';

/** Full-access context for internal administrators (bypasses tenant RLS). */
export function internalTenantContext(): TenantContext {
  return { isInternal: true };
}

/** Scoped context for a single company user. */
export function companyTenantContext(companyId: string): TenantContext {
  return { isInternal: false, companyId };
}

/** Derive the tenant context that matches the authenticated JWT session. */
export function tenantContextFromSession(session: AuthSession): TenantContext {
  return {
    isInternal: session.role === UserRole.INTERNAL_ADMIN,
    companyId: session.companyId,
  };
}
