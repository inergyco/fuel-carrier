/**
 * Keep in sync with
 * `@fuel-carrier/shared-validation/company/constants`
 * (`COMPANY_LOGO_MAX_BYTES`, `COMPANY_LOGO_PUBLIC_PREFIX`).
 *
 * Declared locally so the API ESLint project service can type-check these
 * values; it does not resolve that package export reliably.
 */
export const COMPANY_LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const COMPANY_LOGO_PUBLIC_PREFIX = '/api/uploads/company-logos';

/** Fastify body limit: logo file size plus multipart overhead. */
export const COMPANY_LOGO_MULTIPART_BODY_LIMIT =
  COMPANY_LOGO_MAX_BYTES + 256 * 1024;
