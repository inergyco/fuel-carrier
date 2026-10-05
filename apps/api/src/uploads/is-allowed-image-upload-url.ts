const UPLOADED_IMAGE_FILE_PATTERN =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(png|jpg|webp|gif|svg)';

/** Absolute http(s) URLs, or a path produced by an image upload endpoint. */
export function createIsAllowedImageUploadUrl(publicPrefix: string) {
  const uploadedPath = new RegExp(
    `^${publicPrefix}/${UPLOADED_IMAGE_FILE_PATTERN}$`,
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
