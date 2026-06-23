import type { Car } from '@fuel-carrier/shared-types'
import type {
  CreateExternalCarDto,
  UpdateExternalCarDto,
} from '@fuel-carrier/shared-validation/car/create'
import { api } from '../api'

export const carKeys = {
  all: ['cars'] as const,
}

export type CarFormValues = {
  name: string
  licensePlate: string
  note: string
  driverId: string
}

export function carToFormValues(car?: Car): CarFormValues {
  return {
    name: car?.name ?? '',
    licensePlate: car?.licensePlate ?? '',
    note: car?.note ?? '',
    driverId: car?.driverId ?? '',
  }
}

export async function fetchCars(): Promise<Car[]> {
  return api.get('cars').json<Car[]>()
}

export async function createCar(dto: CreateExternalCarDto): Promise<Car> {
  return api.post('cars', { json: dto }).json<Car>()
}

export async function updateCar(
  id: string,
  dto: UpdateExternalCarDto,
): Promise<Car> {
  return api.patch(`cars/${id}`, { json: dto }).json<Car>()
}

export async function deleteCar(id: string): Promise<void> {
  await api.delete(`cars/${id}`).json()
}
