import type { CompanyUserLevel } from "./company-user-level";
import type { UserRole } from "./user-role";

/** Authenticated session derived from the JWT after Passport validation. */
export type AuthSession = {
  userId: string;
  role: UserRole;
  companyId?: string;
  username: string;
  firstName: string;
  lastName: string;
  /** Present for company users; admin can manage data, viewer is read-only. */
  companyUserLevel?: CompanyUserLevel;
  /** Present for company users; true until they set their own password. */
  mustChangePassword?: boolean;
  /** Present for company users when their company has a logo. */
  companyLogoUrl?: string | null;
};
