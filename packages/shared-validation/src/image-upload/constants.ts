export const IMAGE_UPLOAD_URL_MAX_LENGTH = 2048;
export const IMAGE_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;

export const IMAGE_UPLOAD_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

export const COMPANY_LOGO_PUBLIC_PREFIX = '/api/uploads/company-logos';
export const DRIVER_IMAGE_PUBLIC_PREFIX = '/api/uploads/driver-images';

export function normalizeImageUploadMimeType(mimeType: string): string {
  if (mimeType === 'image/jpg') {
    return 'image/jpeg';
  }

  return mimeType;
}

export function isImageUploadMimeType(mimeType: string): boolean {
  const normalized = normalizeImageUploadMimeType(mimeType);
  return (IMAGE_UPLOAD_MIME_TYPES as readonly string[]).includes(normalized);
}

export function createIsAllowedImageUploadUrl(publicPrefix: string) {
  const uploadedPath = new RegExp(
    `^${publicPrefix}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(png|jpg|webp|gif|svg)$`,
    'i',
  );

  return function isAllowedImageUploadUrl(value: string): boolean {
    if (uploadedPath.test(value)) {
      return true;
    }

    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };
}

/** Absolute http(s) URLs, or a path produced by the logo upload endpoint. */
export const isAllowedCompanyLogoUrl = createIsAllowedImageUploadUrl(
  COMPANY_LOGO_PUBLIC_PREFIX,
);

/** Absolute http(s) URLs, or a path produced by the driver image upload endpoint. */
export const isAllowedDriverImageUrl = createIsAllowedImageUploadUrl(
  DRIVER_IMAGE_PUBLIC_PREFIX,
);
