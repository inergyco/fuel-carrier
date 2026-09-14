import { z } from 'zod';
import { paginationQuerySchema } from './pagination-query.dto';

/** Optional company scope + pagination for internal car/driver lists. */
export const companyScopedListQuerySchema = paginationQuerySchema.extend({
  companyId: z.uuid().optional(),
});

export type CompanyScopedListQueryDto = z.infer<
  typeof companyScopedListQuerySchema
>;

/** Required company scope + pagination for company-user lists. */
export const companyRequiredListQuerySchema = paginationQuerySchema.extend({
  companyId: z.uuid(),
});

export type CompanyRequiredListQueryDto = z.infer<
  typeof companyRequiredListQuerySchema
>;
