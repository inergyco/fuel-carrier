import type {
  CarDriverAssignment,
  PaginatedResult,
  PaginationParams,
} from '@fuel-carrier/shared-types'
import { DEFAULT_LIMIT } from '@fuel-carrier/shared-types'
import { api } from '../api'

export const carDriverAssignmentKeys = {
  byCar: (
    carId: string,
    params: PaginationParams = { page: 1, limit: DEFAULT_LIMIT },
  ) => ['cars', carId, 'driver-assignments', params] as const,
}

export async function fetchCarDriverAssignments(
  carId: string,
  searchParams: PaginationParams = { page: 1, limit: DEFAULT_LIMIT },
): Promise<PaginatedResult<CarDriverAssignment>> {
  return api
    .get(`cars/${carId}/driver-assignments`, { searchParams })
    .json<PaginatedResult<CarDriverAssignment>>()
}
