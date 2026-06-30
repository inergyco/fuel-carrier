export const CompanyUserLevels = {
  ADMIN: 'admin',
  VIEWER: 'viewer',
} as const;

export type CompanyUserLevel =
  (typeof CompanyUserLevels)[keyof typeof CompanyUserLevels];

export const COMPANY_USER_LEVELS = [
  CompanyUserLevels.ADMIN,
  CompanyUserLevels.VIEWER,
] as const;

export function isCompanyUserAdmin(session: {
  companyUserLevel?: CompanyUserLevel;
}): boolean {
  return session.companyUserLevel === CompanyUserLevels.ADMIN;
}
