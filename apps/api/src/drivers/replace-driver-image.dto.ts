import { z } from 'zod';
import {
  DRIVER_IMAGE_PUBLIC_PREFIX,
  IMAGE_UPLOAD_URL_MAX_LENGTH,
} from '../uploads/image-upload.constants';
import { createIsAllowedImageUploadUrl } from '../uploads/is-allowed-image-upload-url';

const isAllowedDriverImageUrl = createIsAllowedImageUploadUrl(
  DRIVER_IMAGE_PUBLIC_PREFIX,
);

/**
 * Local schema so the API ESLint project service can resolve the type.
 * Keep rules aligned with shared-validation `replaceDriverImageDtoSchema`.
 */
export const replaceDriverImageDtoSchema = z.object({
  imageUrl: z
    .string()
    .max(
      IMAGE_UPLOAD_URL_MAX_LENGTH,
      `Image URL must be at most ${IMAGE_UPLOAD_URL_MAX_LENGTH} characters`,
    )
    .refine(isAllowedDriverImageUrl, 'Image URL must be a valid URL'),
});

export type ReplaceDriverImageDto = z.infer<typeof replaceDriverImageDtoSchema>;
