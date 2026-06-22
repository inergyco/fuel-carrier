/** Transaction-scoped tenant context propagated to PostgreSQL via SET LOCAL. */
export type TenantContext = {
  /** When true, RLS policies allow access to all tenant rows. */
  isInternal: boolean;
  /** Required for company users; omitted for internal administrators. */
  companyId?: string;
};
