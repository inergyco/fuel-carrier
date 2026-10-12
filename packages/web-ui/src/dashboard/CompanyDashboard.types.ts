import type {
  Car,
  CarFleetStats,
  CarTelemetryMarker,
  FuelGradeFilter,
  FuelLevelFilter,
  PaginatedResult,
  ResourceListParams,
} from '@fuel-carrier/shared-types'
import type { ReactNode } from 'react'
import type { TrajectoryMapViewLabels } from '../map'
import type { CarCardLabels } from './car-card/car-card-labels'

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

export type CompanyDashboardLabels = CarCardLabels & {
  carsLoading: () => string
  carsEmpty: () => string
  carsEmptyFiltered: () => string
  carsSearchPlaceholder: () => string
  viewDetails: () => string
  map: TrajectoryMapViewLabels
}

/** Cars-list search applied when a fleet KPI widget is clicked. Empty = all cars. */
export type FleetStatCarsSearch = {
  fuelLevel?: Exclude<FuelLevelFilter, 'all'>
  fuelGrade?: Extract<FuelGradeFilter, 'highGrade'>
}

export type CompanyDashboardLinkRenderers = {
  renderVehicleLink: (marker: CarTelemetryMarker) => ReactNode
  renderCarDetailsLink: (carId: string) => ReactNode
  renderFleetStatLink: (
    search: FleetStatCarsSearch,
    children: ReactNode,
  ) => ReactNode
}
