import { createFileRoute, Link } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { api, fetchAllPaginated } from '@fuel-carrier/web-ui/api'
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
import { carKeys, fetchCars } from '../../lib/api/cars'

export const Route = createFileRoute('/_authenticated/map')({
  component: MapPage,
})

function MapPage() {
  const { LL } = useI18nContext()
  const isOnline = useNavigatorOnline()
  const telemetryQuery = useCarTelemetryLive(api)
  const carsQuery = useQuery({
    queryKey: [...carKeys.all, 'all'] as const,
    queryFn: () => fetchAllPaginated(fetchCars),
  })

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

  function handleRetry() {
    void telemetryQuery.refetch()
    void carsQuery.refetch()
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
        markers={telemetryQuery.data ?? []}
        isLoading={telemetryQuery.isLoading}
        labels={LL.externalPanel.map}
        renderVehicleLink={renderVehicleLink}
      />
    </div>
  )
}
