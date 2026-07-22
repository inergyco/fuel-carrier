import { z } from 'zod';
import { strongPasswordSchema } from '@fuel-carrier/shared-validation/password';

export type SeedCompaniesDto = {
  DATABASE_URL: string;
  REDIS_URL: string;
  SEED_COMPANY_PASSWORD: string;
};

export const seedCompaniesDtoSchema: z.ZodType<SeedCompaniesDto> = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection string',
    ),
  REDIS_URL: z
    .string()
    .min(1, 'REDIS_URL is required')
    .refine(
      (url) => url.startsWith('redis://') || url.startsWith('rediss://'),
      'REDIS_URL must be a Redis connection string',
    ),
  SEED_COMPANY_PASSWORD: strongPasswordSchema,
});
