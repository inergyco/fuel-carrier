import {
  FUEL_GRADE_FILTERS,
  FUEL_LEVEL_FILTERS,
} from '@fuel-carrier/shared-types'
import { z } from 'zod'
import { paginationQuerySchema } from './pagination-query.dto'

export {
  FUEL_GRADE_FILTERS,
  FUEL_LEVEL_FILTERS,
  type FuelGradeFilter,
  type FuelLevelFilter,
  type ResourceListFilters,
  type ResourceListParams,
} from '@fuel-carrier/shared-types'

export const resourceListQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().max(64).optional(),
    fuelGrade: z.enum(FUEL_GRADE_FILTERS).optional(),
    fuelLevel: z.enum(FUEL_LEVEL_FILTERS).optional(),
  })
  .transform((query) => {
    const searchText = query.search?.trim()

    return {
      page: query.page,
      limit: query.limit,
      search: searchText && searchText.length > 0 ? searchText : undefined,
      fuelGrade: query.fuelGrade ?? 'all',
      fuelLevel: query.fuelLevel ?? 'all',
    }
  })

export type ResourceListQueryDto = z.output<typeof resourceListQuerySchema>
