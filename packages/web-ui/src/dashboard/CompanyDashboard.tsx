import type { ReactNode } from 'react'
import type { KyInstance } from '../api'
import { TrajectoryMapView, useCarTelemetryLive } from '../map'
import { useQuery, useQueryClient } from '../query'
import { ConnectivityBanner, useNavigatorOnline } from '../ui'
import { DashboardCarsSection } from './DashboardCarsSection'
import { FleetStatsSection } from './FleetStatsSection'
import { FuelLevelRingSection } from './FuelLevelRingSection'
import type {
  CompanyDashboardDataSource,
  CompanyDashboardLabels,
  CompanyDashboardLinkRenderers,
} from './CompanyDashboard.types'

export type CompanyDashboardProps = {
  api: KyInstance
  companyId?: string
  /** When false, skip company-scoped queries (e.g. no company selected yet). */
  enabled?: boolean
  dataSource: CompanyDashboardDataSource
  labels: CompanyDashboardLabels
  connectivityLabels: {
    offline: string
    loadFailed: string
    retry: string
  }
  renderVehicleLink: CompanyDashboardLinkRenderers['renderVehicleLink']
  renderCarDetailsLink: CompanyDashboardLinkRenderers['renderCarDetailsLink']
  /** Shown instead of the dashboard when `enabled` is false. */
  emptyState?: ReactNode
}

export function CompanyDashboard({
  api,
  companyId,
  enabled = true,
  dataSource,
  labels,
  connectivityLabels,
  renderVehicleLink,
  renderCarDetailsLink,
  emptyState,
}: CompanyDashboardProps) {
  const queryClient = useQueryClient()

  const mapCarsQuery = useQuery({
    queryKey: dataSource.carsAllKey(companyId),
    queryFn: () => dataSource.fetchAllCars(companyId),
    enabled,
  })

  const telemetryQuery = useCarTelemetryLive(api)
  const isOnline = useNavigatorOnline()

  const markers = telemetryQuery.data ?? []
  const scopedMarkers = companyId
    ? markers.filter((marker) => marker.companyId === companyId)
    : markers

  function handleRetry() {
    void telemetryQuery.refetch()
    void queryClient.invalidateQueries({
      queryKey: dataSource.carsStatsKey(companyId),
    })
  }

  if (!enabled) {
    return (
      <div className="flex min-h-0 flex-col gap-6">
        {emptyState ?? (
          <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
            —
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <ConnectivityBanner
        isOnline={isOnline}
        isQueryError={telemetryQuery.isError}
        onRetry={handleRetry}
        labels={connectivityLabels}
      />

      <FleetStatsSection
        companyId={companyId}
        dataSource={dataSource}
        enabled={enabled}
      />

      <div className="flex min-h-0 flex-col gap-3 lg:flex-row lg:items-stretch">
        <TrajectoryMapView
          className="h-[40svh] min-h-56 w-full flex-1 overflow-hidden rounded-2xl border border-base-content/8 lg:h-auto lg:min-h-72"
          api={api}
          cars={mapCarsQuery.data ?? []}
          markers={scopedMarkers}
          isLoading={telemetryQuery.isLoading || mapCarsQuery.isLoading}
          labels={labels.map}
          renderVehicleLink={renderVehicleLink}
        />
        <FuelLevelRingSection
          className="w-full shrink-0 lg:w-72 xl:w-80"
          companyId={companyId}
          dataSource={dataSource}
          enabled={enabled}
        />
      </div>

      <DashboardCarsSection
        companyId={companyId}
        dataSource={dataSource}
        enabled={enabled}
        labels={labels}
        telemetryMarkers={scopedMarkers}
        renderCarDetailsLink={renderCarDetailsLink}
      />
    </div>
  )
}
