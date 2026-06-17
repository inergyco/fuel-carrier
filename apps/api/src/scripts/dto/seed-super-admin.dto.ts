import { z } from 'zod';
import { strongPasswordSchema } from '@fuel-carrier/shared-validation/password';
import { isValidUsername } from '@fuel-carrier/shared-validation/username';

export type SeedSuperAdminDto = {
  DATABASE_URL: string;
  SUPER_ADMIN_USERNAME: string;
  SUPER_ADMIN_PASSWORD: string;
  SUPER_ADMIN_FIRST_NAME: string;
  SUPER_ADMIN_LAST_NAME: string;
};

export const seedSuperAdminDtoSchema: z.ZodType<SeedSuperAdminDto> = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection string',
    ),
  SUPER_ADMIN_USERNAME: z
    .string()
    .min(1, 'SUPER_ADMIN_USERNAME is required')
    .refine(isValidUsername, {
      message:
        'SUPER_ADMIN_USERNAME must be 3–32 characters and contain only letters, numbers, underscores, and hyphens',
    }),
  SUPER_ADMIN_PASSWORD: strongPasswordSchema,
  SUPER_ADMIN_FIRST_NAME: z
    .string()
    .trim()
    .min(1, 'SUPER_ADMIN_FIRST_NAME is required')
    .max(100),
  SUPER_ADMIN_LAST_NAME: z
    .string()
    .trim()
    .min(1, 'SUPER_ADMIN_LAST_NAME is required')
    .max(100),
});
