import type {
  Driver,
  PaginatedResult,
  ResourceListParams,
} from '@fuel-carrier/shared-types'
import { DEFAULT_LIMIT } from '@fuel-carrier/shared-types'
import type {
  CreateInternalDriverDto,
  UpdateInternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create'
import { api, fetchAllPaginated } from '@fuel-carrier/web-ui/api'
import { toResourceListFilterSearchParams } from '@fuel-carrier/web-ui/ui'

const DEFAULT_LIST_PARAMS: ResourceListParams = {
  page: 1,
  limit: DEFAULT_LIMIT,
  assignment: 'all',
}

export const driverKeys = {
  all: ['drivers'] as const,
  byCompany: (
    companyId: string,
    params: ResourceListParams = DEFAULT_LIST_PARAMS,
  ) => ['drivers', companyId, params] as const,
}

export type DriverFormValues = {
  firstName: string
  lastName: string
  nationalId: string
}

export type FetchDriversParams = ResourceListParams & {
  companyId?: string
}

export function driverToFormValues(driver?: Driver): DriverFormValues {
  return {
    firstName: driver?.firstName ?? '',
    lastName: driver?.lastName ?? '',
    nationalId: driver?.nationalId ?? '',
  }
}

export async function fetchDrivers(
  params: FetchDriversParams = DEFAULT_LIST_PARAMS,
): Promise<PaginatedResult<Driver>> {
  const { companyId, page, limit } = params
  return api
    .get('drivers', {
      searchParams: {
        page,
        limit,
        ...(typeof companyId === 'string' ? { companyId } : {}),
        ...toResourceListFilterSearchParams(params),
      },
    })
    .json<PaginatedResult<Driver>>()
}

export async function fetchAllDrivers(companyId?: string): Promise<Driver[]> {
  return fetchAllPaginated((pagination) =>
    fetchDrivers({
      ...pagination,
      assignment: 'all',
      ...(typeof companyId === 'string' ? { companyId } : {}),
    }),
  )
}

export async function createDriver(
  dto: CreateInternalDriverDto,
): Promise<Driver> {
  return api.post('drivers', { json: dto }).json<Driver>()
}

export async function updateDriver(
  id: string,
  dto: UpdateInternalDriverDto,
): Promise<Driver> {
  return api.patch(`drivers/${id}`, { json: dto }).json<Driver>()
}

export async function deleteDriver(id: string): Promise<void> {
  await api.delete(`drivers/${id}`).json()
}
