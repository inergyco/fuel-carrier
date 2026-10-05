import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { api, fetchAllPaginated } from '@fuel-carrier/web-ui/api'
import {
  CompanyDashboard,
  type CompanyDashboardDataSource,
  type CompanyDashboardLabels,
  dashboardCarDetailsLinkClassName,
} from '@fuel-carrier/web-ui/dashboard'
import { Info } from '@fuel-carrier/web-ui/icons'
import {
  mapPopupActionClassName,
} from '@fuel-carrier/web-ui/map'
import { buttonClassName, ICON_STROKE_WIDTH } from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { Link } from '@tanstack/react-router'
import { carKeys, fetchCarFleetStats, fetchCars } from '../../lib/api/cars'

const dashboardDataSource: CompanyDashboardDataSource = {
  fetchCars,
  fetchAllCars: () => fetchAllPaginated(fetchCars),
  fetchFleetStats: () => fetchCarFleetStats(),
  carsListKey: carKeys.list,
  carsAllKey: () => [...carKeys.all, 'all'] as const,
  carsStatsKey: () => carKeys.stats,
}

export function DashboardPage() {
  const { LL } = useI18nContext()

  const labels: CompanyDashboardLabels = {
    carsLoading: LL.externalPanel.cars.loading,
    carsEmpty: LL.externalPanel.cars.empty,
    carsEmptyFiltered: LL.externalPanel.cars.emptyFiltered,
    carsSearchPlaceholder: LL.externalPanel.cars.searchPlaceholder,
    locationLive: LL.externalPanel.home.locationLive,
    statusOffline: LL.externalPanel.home.statusOffline,
    noDriver: LL.externalPanel.cars.noDriver,
    mobileUnknown: LL.externalPanel.home.mobileUnknown,
    remainFuelUnknown: LL.externalPanel.cars.remainFuelUnknown,
    tankUnit: LL.externalPanel.cars.tankUnit,
    fuelVolumeOfCapacity: LL.externalPanel.home.fuelVolumeOfCapacity,
    viewDetails: LL.externalPanel.auditLogs.details,
    fuelType: LL.externalPanel.cars,
    map: LL.externalPanel.map,
  }

  function renderVehicleLink(marker: CarTelemetryMarker) {
    return (
      <Link
        to="/cars/$carId"
        params={{ carId: marker.carId }}
        className={cn(buttonClassName.outline, mapPopupActionClassName)}
      >
        {LL.externalPanel.map.viewVehicle()}
      </Link>
    )
  }

  function renderCarDetailsLink(carId: string) {
    return (
      <Link
        to="/cars/$carId"
        params={{ carId }}
        className={dashboardCarDetailsLinkClassName}
      >
        <Info
          className="size-3.5"
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
        {labels.viewDetails()}
      </Link>
    )
  }

  return (
    <CompanyDashboard
      api={api}
      dataSource={dashboardDataSource}
      labels={labels}
      connectivityLabels={{
        offline: LL.common.connectivity.offline(),
        loadFailed: LL.common.connectivity.loadFailed(),
        retry: LL.common.connectivity.retry(),
      }}
      renderVehicleLink={renderVehicleLink}
      renderCarDetailsLink={renderCarDetailsLink}
    />
  )
}
