/**
 * Cars/drivers list options used by services.
 * Kept local (not Zod DTO / package re-export) so Nest type-aware lint
 * does not depend on cross-package resolution of composed types.
 */
export type CompanyScopedListParams = {
  page: number;
  limit: number;
  search?: string;
  assignment?: 'all' | 'assigned' | 'unassigned';
  companyId?: string;
};
