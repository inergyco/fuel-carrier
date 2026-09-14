import type { Driver } from '@fuel-carrier/shared-types'
import type {
  CreateInternalDriverDto,
  UpdateInternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create'
import { api } from '@fuel-carrier/web-ui/api'

export const driverKeys = {
  all: ['drivers'] as const,
  byCompany: (companyId: string) => ['drivers', companyId] as const,
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

export async function fetchDrivers(companyId?: string): Promise<Driver[]> {
  return api
    .get('drivers', {
      searchParams:
        typeof companyId === 'string' ? { companyId } : undefined,
    })
    .json<Driver[]>()
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
