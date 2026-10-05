import { createFileRoute, Link } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { api } from '@fuel-carrier/web-ui/api'
import {
  mapPopupActionClassName,
  TrajectoryMapView,
  useCarTelemetryLive,
} from '@fuel-carrier/web-ui/map'
import {
  buttonClassName,
  ConnectivityBanner,
  useNavigatorOnline,
} from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { carKeys, fetchAllCars } from '../../lib/api/cars'
import { useActiveCompany } from '../../components/shell/activeCompanyContext'

export const Route = createFileRoute('/_authenticated/map')({
  component: MapPage,
})

function MapPage() {
  const { LL } = useI18nContext()
  const isOnline = useNavigatorOnline()
  const { companyId, hasCompanies, isLoading: isCompaniesLoading } =
    useActiveCompany()
  const enabled = Boolean(companyId) && hasCompanies && !isCompaniesLoading

  const telemetryQuery = useCarTelemetryLive(api)
  const carsQuery = useQuery({
    queryKey: carKeys.allByCompany(companyId ?? ''),
    queryFn: () => fetchAllCars(companyId!),
    enabled,
  })

  const markers = telemetryQuery.data ?? []
  const scopedMarkers = companyId
    ? markers.filter((marker) => marker.companyId === companyId)
    : []

  function renderVehicleLink(marker: CarTelemetryMarker) {
    return (
      <Link
        to="/companies/$companyId/cars/$carId"
        params={{ companyId: marker.companyId, carId: marker.carId }}
        className={cn(buttonClassName.outline, mapPopupActionClassName)}
      >
        {LL.internalPanel.map.viewVehicle()}
      </Link>
    )
  }

  function handleRetry() {
    void telemetryQuery.refetch()
    void carsQuery.refetch()
  }

  if (!enabled) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
          {isCompaniesLoading
            ? LL.internalPanel.home.loading()
            : LL.internalPanel.home.empty()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <ConnectivityBanner
        isOnline={isOnline}
        isQueryError={telemetryQuery.isError || carsQuery.isError}
        onRetry={handleRetry}
        labels={{
          offline: LL.common.connectivity.offline(),
          loadFailed: LL.common.connectivity.loadFailed(),
          retry: LL.common.connectivity.retry(),
        }}
      />
      <TrajectoryMapView
        api={api}
        cars={carsQuery.data ?? []}
        markers={scopedMarkers}
        isLoading={telemetryQuery.isLoading || carsQuery.isLoading}
        labels={LL.internalPanel.map}
        renderVehicleLink={renderVehicleLink}
      />
    </div>
  )
}
