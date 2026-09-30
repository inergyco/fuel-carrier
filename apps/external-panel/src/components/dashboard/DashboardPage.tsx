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
import { useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { Link } from '@tanstack/react-router'
import { carKeys, fetchCars } from '../../lib/api/cars'
import { DashboardCarsSection } from './DashboardCarsSection'
import { FleetStatsSection } from './FleetStatsSection'
import { FuelLevelRingSection } from './FuelLevelRingSection'

export function DashboardPage() {
  const { LL } = useI18nContext()
  const queryClient = useQueryClient()

  const mapCarsQuery = useQuery({
    queryKey: [...carKeys.all, 'all'] as const,
    queryFn: () => fetchAllPaginated(fetchCars),
  })

  const telemetryQuery = useCarTelemetryLive(api)
  const isOnline = useNavigatorOnline()

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

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <ConnectivityBanner
        isOnline={isOnline}
        isQueryError={telemetryQuery.isError}
        onRetry={() => {
          void telemetryQuery.refetch()
          void queryClient.invalidateQueries({ queryKey: carKeys.stats })
        }}
        labels={{
          offline: LL.common.connectivity.offline(),
          loadFailed: LL.common.connectivity.loadFailed(),
          retry: LL.common.connectivity.retry(),
        }}
      />

      <FleetStatsSection />

      <div className="flex min-h-0 flex-col gap-3 lg:flex-row lg:items-stretch">
        <TrajectoryMapView
          className="h-[40svh] min-h-56 w-full flex-1 overflow-hidden rounded-2xl border border-base-content/8 lg:h-auto lg:min-h-72"
          api={api}
          cars={mapCarsQuery.data ?? []}
          markers={telemetryQuery.data ?? []}
          isLoading={telemetryQuery.isLoading || mapCarsQuery.isLoading}
          labels={LL.externalPanel.map}
          renderVehicleLink={renderVehicleLink}
          titleAs="h2"
        />
        <FuelLevelRingSection className="w-full shrink-0 lg:w-72 xl:w-80" />
      </div>

      <DashboardCarsSection telemetryMarkers={telemetryQuery.data ?? []} />
    </div>
  )
}
