import type { CarFuelTypeLabels } from '../../cars'

export type CarCardLabels = {
  locationLive: () => string
  statusOffline: () => string
  noDriver: () => string
  mobileUnknown: () => string
  remainFuelUnknown: () => string
  tankUnit: () => string
  fuelVolumeOfCapacity: (params: {
    volume: string
    capacity: string
    unit: string
  }) => string
  fuelType: CarFuelTypeLabels
}
