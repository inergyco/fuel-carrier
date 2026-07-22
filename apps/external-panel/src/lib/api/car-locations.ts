import type { CarLocationMarker } from '@fuel-carrier/shared-types'
import { api } from '../api'

export const carLocationKeys = {
  all: ['car-locations'] as const,
}

export async function fetchCarLocations(): Promise<CarLocationMarker[]> {
  return api.get('car-locations').json<CarLocationMarker[]>()
}
