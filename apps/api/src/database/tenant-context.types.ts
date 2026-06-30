import type { AuthSession, TenantContext } from '@fuel-carrier/shared-types';

/** API-layer tenant context; optional actor is used for audit attribution. */
export type ApiTenantContext = TenantContext & {
  actor?: AuthSession;
};
