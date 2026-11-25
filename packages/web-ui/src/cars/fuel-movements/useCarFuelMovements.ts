import type {
  CarFuelMovement,
  PaginatedResult,
} from '@fuel-carrier/shared-types'
import { api } from '../../api'
import { useQuery } from '../../query'

export type CarFuelMovementFilters = {
  carId: string
  page: number
  limit: number
  start?: string
  end?: string
}

export const carFuelMovementKeys = {
  all: ['car-fuel-movements'] as const,
  list: (filters: CarFuelMovementFilters) =>
    [
      ...carFuelMovementKeys.all,
      filters.carId,
      filters.page,
      filters.limit,
      filters.start,
      filters.end,
    ] as const,
}

export function fetchCarFuelMovements(
  filters: CarFuelMovementFilters,
): Promise<PaginatedResult<CarFuelMovement>> {
  const searchParams: Record<string, string | number> = {
    carId: filters.carId,
    page: filters.page,
    limit: filters.limit,
  }

  if (filters.start) {
    searchParams.start = filters.start
  }

  if (filters.end) {
    searchParams.end = filters.end
  }

  return api
    .get('car-telemetry/movements', { searchParams })
    .json<PaginatedResult<CarFuelMovement>>()
}

export function useCarFuelMovements(filters: CarFuelMovementFilters) {
  return useQuery({
    queryKey: carFuelMovementKeys.list(filters),
    queryFn: function loadCarFuelMovements() {
      return fetchCarFuelMovements(filters)
    },
    placeholderData: (previous) => previous,
  })
}
