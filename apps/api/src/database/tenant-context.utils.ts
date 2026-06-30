import type { AuthSession, TenantContext } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import type { ApiTenantContext } from './tenant-context.types';

/** Full-access context for internal administrators (bypasses tenant RLS). */
export function internalTenantContext(actor?: AuthSession): ApiTenantContext {
  return actor ? { isInternal: true, actor } : { isInternal: true };
}

/** Scoped context for a single company user. */
export function companyTenantContext(companyId: string): ApiTenantContext {
  return { isInternal: false, companyId };
}

/** Derive the tenant context that matches the authenticated JWT session. */
export function tenantContextFromSession(
  session: AuthSession,
): ApiTenantContext {
  return {
    isInternal: session.role === UserRole.INTERNAL_ADMIN,
    companyId: session.companyId,
    actor: session,
  };
}

export function getTenantContextActor(
  context: TenantContext,
): AuthSession | undefined {
  return (context as ApiTenantContext).actor;
}
