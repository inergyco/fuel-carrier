import { createFileRoute, Link } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { api } from '@fuel-carrier/web-ui/api'
import { FleetMapView, useCarTelemetryLive } from '@fuel-carrier/web-ui/map'

export const Route = createFileRoute('/_authenticated/map')({
  component: MapPage,
})

function MapPage() {
  const { LL } = useI18nContext()
  const telemetryQuery = useCarTelemetryLive(api)

  function renderVehicleLink(marker: CarTelemetryMarker) {
    return (
      <Link
        to="/companies/$companyId/cars/$carId"
        params={{ companyId: marker.companyId, carId: marker.carId }}
        className="inline-flex text-xs font-medium text-primary hover:underline"
      >
        {LL.internalPanel.map.viewVehicle()}
      </Link>
    )
  }

  return (
    <FleetMapView
      markers={telemetryQuery.data ?? []}
      isLoading={telemetryQuery.isLoading}
      labels={LL.internalPanel.map}
      renderVehicleLink={renderVehicleLink}
      colorByCompany
    />
  )
}
