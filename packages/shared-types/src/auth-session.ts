import type { UserRole } from './user-role';

/** Authenticated session derived from the JWT after Passport validation. */
export type AuthSession = {
  userId: string;
  role: UserRole;
  companyId?: string;
  username: string;
  firstName: string;
  lastName: string;
};
