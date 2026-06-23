import type { Driver } from '@fuel-carrier/shared-types'
import type {
  CreateExternalDriverDto,
  UpdateExternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create'
import { api } from '../api'

export const driverKeys = {
  all: ['drivers'] as const,
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

export async function fetchDrivers(): Promise<Driver[]> {
  return api.get('drivers').json<Driver[]>()
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
