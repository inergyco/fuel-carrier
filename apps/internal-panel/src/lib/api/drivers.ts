import type {
  Driver,
  PaginatedResult,
  PaginationParams,
} from '@fuel-carrier/shared-types'
import { DEFAULT_LIMIT } from '@fuel-carrier/shared-types'
import type {
  CreateInternalDriverDto,
  UpdateInternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create'
import { api, fetchAllPaginated } from '@fuel-carrier/web-ui/api'

export const driverKeys = {
  all: ['drivers'] as const,
  byCompany: (
    companyId: string,
    params: PaginationParams = { page: 1, limit: DEFAULT_LIMIT },
  ) => ['drivers', companyId, params] as const,
}

export type DriverFormValues = {
  firstName: string
  lastName: string
  nationalId: string
}

export type FetchDriversParams = PaginationParams & {
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
  params: FetchDriversParams = { page: 1, limit: DEFAULT_LIMIT },
): Promise<PaginatedResult<Driver>> {
  const { companyId, page, limit } = params
  return api
    .get('drivers', {
      searchParams: {
        page,
        limit,
        ...(typeof companyId === 'string' ? { companyId } : {}),
      },
    })
    .json<PaginatedResult<Driver>>()
}

export async function fetchAllDrivers(companyId?: string): Promise<Driver[]> {
  return fetchAllPaginated((pagination) =>
    fetchDrivers({
      ...pagination,
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
