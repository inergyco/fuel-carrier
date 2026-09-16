import { ASSIGNMENT_FILTERS } from '@fuel-carrier/shared-types/resource-list'
import { z } from 'zod'
import { paginationQuerySchema } from './pagination-query.dto'

export {
  ASSIGNMENT_FILTERS,
  type AssignmentFilter,
  type ResourceListFilters,
  type ResourceListParams,
} from '@fuel-carrier/shared-types/resource-list'

export const resourceListQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().max(64).optional(),
    assignment: z.enum(ASSIGNMENT_FILTERS).optional(),
  })
  .transform((query) => {
    const searchText = query.search?.trim()

    return {
      page: query.page,
      limit: query.limit,
      search: searchText && searchText.length > 0 ? searchText : undefined,
      assignment: query.assignment ?? 'all',
    }
  })

export type ResourceListQueryDto = z.output<typeof resourceListQuerySchema>
