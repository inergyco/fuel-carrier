import { z } from 'zod';
import { ASSIGNMENT_FILTERS } from '@fuel-carrier/shared-types/resource-list';
import { paginationQuerySchema } from './pagination-query.dto';

/** Optional company scope + pagination + list filters for internal car/driver lists. */
export const companyScopedListQuerySchema = paginationQuerySchema
  .extend({
    companyId: z.uuid().optional(),
    search: z.string().max(64).optional(),
    assignment: z.enum(ASSIGNMENT_FILTERS).optional(),
  })
  .transform((query) => {
    const searchText = query.search?.trim();

    return {
      page: query.page,
      limit: query.limit,
      companyId: query.companyId,
      search: searchText && searchText.length > 0 ? searchText : undefined,
      assignment: query.assignment ?? 'all',
    };
  });

export type CompanyScopedListQueryDto = z.output<
  typeof companyScopedListQuerySchema
>;

/** Required company scope + pagination for company-user lists. */
export const companyRequiredListQuerySchema = paginationQuerySchema.extend({
  companyId: z.uuid(),
});

export type CompanyRequiredListQueryDto = z.infer<
  typeof companyRequiredListQuerySchema
>;
