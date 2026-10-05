export const COMPANY_NAME_MAX_LENGTH = 200;
export const COMPANY_NATIONAL_ID_MAX_LENGTH = 32;
export const COMPANY_PHONE_MAX_LENGTH = 20;
export const COMPANY_ADDRESS_MAX_LENGTH = 500;
export const COMPANY_NOTE_MAX_LENGTH = 5000;
export const COMPANY_LOGO_URL_MAX_LENGTH = 2048;
export const COMPANY_LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const COMPANY_LOGO_PUBLIC_PREFIX = '/api/uploads/company-logos';

export const COMPANY_LOGO_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

const UPLOADED_COMPANY_LOGO_PATH =
  /^\/api\/uploads\/company-logos\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp|gif|svg)$/i;

export function normalizeCompanyLogoMimeType(mimeType: string): string {
  if (mimeType === 'image/jpg') {
    return 'image/jpeg';
  }

  return mimeType;
}

export function isCompanyLogoMimeType(mimeType: string): boolean {
  const normalized = normalizeCompanyLogoMimeType(mimeType);
  return (COMPANY_LOGO_MIME_TYPES as readonly string[]).includes(normalized);
}

/** Absolute http(s) URLs, or a path produced by the logo upload endpoint. */
export function isAllowedCompanyLogoUrl(value: string): boolean {
  if (UPLOADED_COMPANY_LOGO_PATH.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
