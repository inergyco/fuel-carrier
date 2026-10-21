import { z } from 'zod';
import {
  COMPANY_USER_IMAGE_PUBLIC_PREFIX,
  IMAGE_UPLOAD_URL_MAX_LENGTH,
} from '../uploads/image-upload.constants';
import { createIsAllowedImageUploadUrl } from '../uploads/is-allowed-image-upload-url';

const isAllowedCompanyUserImageUrl = createIsAllowedImageUploadUrl(
  COMPANY_USER_IMAGE_PUBLIC_PREFIX,
);

/**
 * Local schema so the API ESLint project service can resolve the type.
 * Keep rules aligned with shared-validation `replaceCompanyUserImageDtoSchema`.
 */
export type ReplaceCompanyUserImageDto = {
  imageUrl: string;
};

export const replaceCompanyUserImageDtoSchema: z.ZodType<ReplaceCompanyUserImageDto> =
  z.object({
    imageUrl: z
      .string()
      .max(
        IMAGE_UPLOAD_URL_MAX_LENGTH,
        `Image URL must be at most ${IMAGE_UPLOAD_URL_MAX_LENGTH} characters`,
      )
      .refine(isAllowedCompanyUserImageUrl, 'Image URL must be a valid URL'),
  });
