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
