import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { api } from '@fuel-carrier/web-ui/api'
import {
  CompanyDashboard,
  type CompanyDashboardDataSource,
  type CompanyDashboardLabels,
  dashboardCarDetailsLinkClassName,
} from '@fuel-carrier/web-ui/dashboard'
import { Info } from '@fuel-carrier/web-ui/icons'
import { mapPopupActionClassName } from '@fuel-carrier/web-ui/map'
import { buttonClassName, ICON_STROKE_WIDTH } from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { Link } from '@tanstack/react-router'
import {
  carKeys,
  fetchAllCars,
  fetchCarFleetStats,
  fetchCars,
} from '../../lib/api/cars'
import { useActiveCompany } from '../shell/activeCompanyContext'

const dashboardDataSource: CompanyDashboardDataSource = {
  fetchCars,
  fetchAllCars: (scopedCompanyId) => fetchAllCars(scopedCompanyId),
  fetchFleetStats: (scopedCompanyId) => {
    if (!scopedCompanyId) {
      return Promise.reject(new Error('companyId is required'))
    }
    return fetchCarFleetStats(scopedCompanyId)
  },
  carsListKey: (params) => carKeys.byCompany(params.companyId ?? '', params),
  carsAllKey: (scopedCompanyId) => carKeys.allByCompany(scopedCompanyId ?? ''),
  carsStatsKey: (scopedCompanyId) => carKeys.stats(scopedCompanyId ?? ''),
}

export function DashboardPage() {
  const { LL } = useI18nContext()
  const { companyId, hasCompanies, isLoading } = useActiveCompany()
  const detail = LL.internalPanel.companies.detail

  const labels: CompanyDashboardLabels = {
    carsLoading: LL.internalPanel.companies.loading,
    carsEmpty: detail.carsEmpty,
    carsEmptyFiltered: detail.carsEmptyFiltered,
    carsSearchPlaceholder: detail.carsSearchPlaceholder,
    locationLive: LL.internalPanel.home.vehicleLive,
    statusOffline: LL.internalPanel.home.vehicleOffline,
    noDriver: detail.noDriver,
    mobileUnknown: LL.internalPanel.home.mobileUnknown,
    remainFuelUnknown: detail.remainFuelUnknown,
    tankUnit: detail.tankUnit,
    fuelVolumeOfCapacity: LL.internalPanel.home.fuelVolumeOfCapacity,
    viewDetails: detail.viewCar,
    fuelType: detail,
    map: LL.internalPanel.map,
  }

  function renderVehicleLink(marker: CarTelemetryMarker) {
    if (!companyId) {
      return null
    }

    return (
      <Link
        to="/companies/$companyId/cars/$carId"
        params={{ companyId, carId: marker.carId }}
        className={cn(buttonClassName.outline, mapPopupActionClassName)}
      >
        {LL.internalPanel.map.viewVehicle()}
      </Link>
    )
  }

  function renderCarDetailsLink(carId: string) {
    if (!companyId) {
      return null
    }

    return (
      <Link
        to="/companies/$companyId/cars/$carId"
        params={{ companyId, carId }}
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

  const enabled = Boolean(companyId) && hasCompanies && !isLoading

  return (
    <CompanyDashboard
      api={api}
      companyId={companyId ?? undefined}
      enabled={enabled}
      dataSource={dashboardDataSource}
      labels={labels}
      connectivityLabels={{
        offline: LL.common.connectivity.offline(),
        loadFailed: LL.common.connectivity.loadFailed(),
        retry: LL.common.connectivity.retry(),
      }}
      renderVehicleLink={renderVehicleLink}
      renderCarDetailsLink={renderCarDetailsLink}
      emptyState={
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
          {isLoading
            ? LL.internalPanel.home.loading()
            : LL.internalPanel.home.empty()}
        </div>
      }
    />
  )
}
