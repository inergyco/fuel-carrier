export const UserRole = {
  INTERNAL_ADMIN: 'internal_admin',
  COMPANY_USER: 'company_user',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
