export type { AuthSession } from '@fuel-carrier/shared-types';
export type { TenantContext } from '@fuel-carrier/shared-types';

import type { UserRole } from '@fuel-carrier/shared-types';

/** JWT payload signed by AuthService and validated by JwtStrategy. */
export type JwtPayload = {
  /** Maps to AuthSession.userId */
  sub: string;
  role: UserRole;
  companyId?: string;
  username: string;
  firstName: string;
  lastName: string;
  mustChangePassword?: boolean;
};
