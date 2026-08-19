export type { AuthSession } from '@fuel-carrier/shared-types';
export type { TenantContext } from '@fuel-carrier/shared-types';

import type { CompanyUserLevel, UserRole } from '@fuel-carrier/shared-types';

/** JWT payload signed by AuthService and validated by JwtStrategy. */
export type JwtPayload = {
  /** Maps to AuthSession.userId */
  sub: string;
  role: UserRole;
  companyId?: string;
  companyUserLevel?: CompanyUserLevel;
  username: string;
  firstName: string;
  lastName: string;
  mustChangePassword?: boolean;
  /** Unique id of this token (jwt `jti`). Used to revoke on logout. */
  jti: string;
  /** Unix expiry from the signed token. */
  exp?: number;
};
