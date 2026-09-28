import type { CompanyUserLevel } from './company-user-level';

export type CompanyUser = {
  id: string;
  userId: string;
  companyId: string;
  username: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  email: string | null;
  level: CompanyUserLevel;
  /** ISO-8601 timestamptz when soft-deleted; null while live. */
  deletedAt: string | null;
};

export type CompanyUserInput = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  companyId: string;
  level: CompanyUserLevel;
  nationalId?: string | null;
  email?: string | null;
};
