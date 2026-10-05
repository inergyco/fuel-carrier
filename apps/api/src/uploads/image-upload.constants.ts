/**
 * Keep in sync with
 * `@fuel-carrier/shared-validation/image-upload/constants`
 * (`IMAGE_UPLOAD_MAX_BYTES`, public prefixes).
 *
 * Declared locally so the API ESLint project service can type-check these
 * values; it does not resolve that package export reliably.
 */
export const IMAGE_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
export const IMAGE_UPLOAD_URL_MAX_LENGTH = 2048;
export const COMPANY_LOGO_PUBLIC_PREFIX = '/api/uploads/company-logos';
export const DRIVER_IMAGE_PUBLIC_PREFIX = '/api/uploads/driver-images';

/** Fastify body limit: image file size plus multipart overhead. */
export const IMAGE_UPLOAD_MULTIPART_BODY_LIMIT =
  IMAGE_UPLOAD_MAX_BYTES + 256 * 1024;
