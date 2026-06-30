import type { CompanyUserLevel } from '@fuel-carrier/shared-types';

export function toCompanyUserLevel(
  value: unknown,
): CompanyUserLevel | undefined {
  if (value === 'admin' || value === 'viewer') {
    return value;
  }

  return undefined;
}

export function resolveCompanyUserLevel(
  value: unknown,
  fallback: CompanyUserLevel,
): CompanyUserLevel {
  return toCompanyUserLevel(value) ?? fallback;
}
