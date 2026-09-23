import { z } from 'zod';
import { paginationQuerySchema } from './pagination-query.dto';

/** Pagination + name/national-id search for the companies list. */
export const companyListQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().max(64).optional(),
  })
  .transform((query) => {
    const searchText = query.search?.trim();

    return {
      page: query.page,
      limit: query.limit,
      search: searchText && searchText.length > 0 ? searchText : undefined,
    };
  });

export type CompanyListQueryDto = z.output<typeof companyListQuerySchema>;
