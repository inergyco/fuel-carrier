import type {
  Car,
  CarFleetStats,
  CarTelemetryMarker,
  PaginatedResult,
  ResourceListParams,
} from '@fuel-carrier/shared-types'
import type { ReactNode } from 'react'
import type { CarFuelTypeLabels } from '../cars'
import type { TrajectoryMapViewLabels } from '../map'

export type CompanyDashboardListParams = ResourceListParams & {
  companyId?: string
}

export type CompanyDashboardDataSource = {
  fetchCars: (
    params: CompanyDashboardListParams,
  ) => Promise<PaginatedResult<Car>>
  fetchAllCars: (companyId?: string) => Promise<Car[]>
  fetchFleetStats: (companyId?: string) => Promise<CarFleetStats>
  carsListKey: (params: CompanyDashboardListParams) => readonly unknown[]
  carsAllKey: (companyId?: string) => readonly unknown[]
  carsStatsKey: (companyId?: string) => readonly unknown[]
}

export type CompanyDashboardLabels = {
  carsLoading: () => string
  carsEmpty: () => string
  carsEmptyFiltered: () => string
  carsSearchPlaceholder: () => string
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
  viewDetails: () => string
  fuelType: CarFuelTypeLabels
  map: TrajectoryMapViewLabels
}

export type CompanyDashboardLinkRenderers = {
  renderVehicleLink: (marker: CarTelemetryMarker) => ReactNode
  renderCarDetailsLink: (carId: string) => ReactNode
}
