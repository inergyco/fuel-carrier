import { z } from 'zod';
import { COMPANY_LOGO_PUBLIC_PREFIX } from './company-logo.constants';

/** Keep in sync with shared-validation `COMPANY_LOGO_URL_MAX_LENGTH`. */
const COMPANY_LOGO_URL_MAX_LENGTH = 2048;

const UPLOADED_COMPANY_LOGO_PATH = new RegExp(
  `^${COMPANY_LOGO_PUBLIC_PREFIX}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(png|jpg|webp|gif|svg)$`,
  'i',
);

function isAllowedCompanyLogoUrl(value: string): boolean {
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

/**
 * Local schema so the API ESLint project service can resolve the type.
 * Keep rules aligned with shared-validation `replaceCompanyLogoDtoSchema`.
 */
export const replaceCompanyLogoDtoSchema = z.object({
  logoUrl: z
    .string()
    .max(
      COMPANY_LOGO_URL_MAX_LENGTH,
      `Logo URL must be at most ${COMPANY_LOGO_URL_MAX_LENGTH} characters`,
    )
    .refine(isAllowedCompanyLogoUrl, 'Logo URL must be a valid URL'),
});

export type ReplaceCompanyLogoDto = z.infer<typeof replaceCompanyLogoDtoSchema>;
