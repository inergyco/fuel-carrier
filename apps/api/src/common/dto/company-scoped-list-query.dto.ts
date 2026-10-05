import { FUEL_LEVEL_FILTERS } from '@fuel-carrier/shared-types';
import { z } from 'zod';
import { paginationQuerySchema } from './pagination-query.dto';

const fuelGradeFilterSchema = z.enum(['all', 'highGrade', 'normal']);

/** Optional company scope + pagination + list filters for internal car/driver lists. */
export const companyScopedListQuerySchema = paginationQuerySchema
  .extend({
    companyId: z.uuid().optional(),
    search: z.string().max(64).optional(),
    fuelGrade: fuelGradeFilterSchema.optional(),
    fuelLevel: z.enum(FUEL_LEVEL_FILTERS).optional(),
  })
  .transform((query) => {
    const searchText = query.search?.trim();

    return {
      page: query.page,
      limit: query.limit,
      companyId: query.companyId,
      search: searchText && searchText.length > 0 ? searchText : undefined,
      fuelGrade: query.fuelGrade ?? 'all',
      fuelLevel: query.fuelLevel ?? 'all',
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
