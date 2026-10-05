import { z } from 'zod';
import {
  COMPANY_LOGO_PUBLIC_PREFIX,
  IMAGE_UPLOAD_URL_MAX_LENGTH,
} from '../uploads/image-upload.constants';
import { createIsAllowedImageUploadUrl } from '../uploads/is-allowed-image-upload-url';

const isAllowedCompanyLogoUrl = createIsAllowedImageUploadUrl(
  COMPANY_LOGO_PUBLIC_PREFIX,
);

/**
 * Local schema so the API ESLint project service can resolve the type.
 * Keep rules aligned with shared-validation `replaceCompanyLogoDtoSchema`.
 */
export const replaceCompanyLogoDtoSchema = z.object({
  logoUrl: z
    .string()
    .max(
      IMAGE_UPLOAD_URL_MAX_LENGTH,
      `Logo URL must be at most ${IMAGE_UPLOAD_URL_MAX_LENGTH} characters`,
    )
    .refine(isAllowedCompanyLogoUrl, 'Logo URL must be a valid URL'),
});

export type ReplaceCompanyLogoDto = z.infer<typeof replaceCompanyLogoDtoSchema>;
