import type {
  Driver,
  PaginatedResult,
  ResourceListParams,
} from '@fuel-carrier/shared-types'
import { DEFAULT_LIMIT } from '@fuel-carrier/shared-types'
import type {
  CreateExternalDriverDto,
  UpdateExternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create'
import { api } from '@fuel-carrier/web-ui/api'
import { toResourceListFilterSearchParams } from '@fuel-carrier/web-ui/ui'

const DEFAULT_LIST_PARAMS: ResourceListParams = {
  page: 1,
  limit: DEFAULT_LIMIT,
  assignment: 'all',
}

export const driverKeys = {
  all: ['drivers'] as const,
  list: (params: ResourceListParams = DEFAULT_LIST_PARAMS) =>
    ['drivers', 'list', params] as const,
}

export type DriverFormValues = {
  firstName: string
  lastName: string
  nationalId: string
}

export function driverToFormValues(driver?: Driver): DriverFormValues {
  return {
    firstName: driver?.firstName ?? '',
    lastName: driver?.lastName ?? '',
    nationalId: driver?.nationalId ?? '',
  }
}

export async function fetchDrivers(
  params: ResourceListParams = DEFAULT_LIST_PARAMS,
): Promise<PaginatedResult<Driver>> {
  return api
    .get('drivers', {
      searchParams: {
        page: params.page,
        limit: params.limit,
        ...toResourceListFilterSearchParams(params),
      },
    })
    .json<PaginatedResult<Driver>>()
}

export async function createDriver(
  dto: CreateExternalDriverDto,
): Promise<Driver> {
  return api.post('drivers', { json: dto }).json<Driver>()
}

export async function updateDriver(
  id: string,
  dto: UpdateExternalDriverDto,
): Promise<Driver> {
  return api.patch(`drivers/${id}`, { json: dto }).json<Driver>()
}

export async function deleteDriver(id: string): Promise<void> {
  await api.delete(`drivers/${id}`).json()
}
