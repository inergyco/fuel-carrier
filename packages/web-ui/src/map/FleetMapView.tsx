import type { CarLocationMarker } from '@fuel-carrier/shared-types'
import type { ReactNode } from 'react'
import { CarsMap, type CarsMapLabels } from './CarsMap'

export type FleetMapViewLabels = CarsMapLabels & {
  title: () => string
  loading: () => string
  empty: () => string
  vehiclesOnMap: (params: { count: number }) => string
}

export type FleetMapViewProps = {
  markers: CarLocationMarker[]
  isLoading: boolean
  labels: FleetMapViewLabels
  renderVehicleLink: (marker: CarLocationMarker) => ReactNode
}

export function FleetMapView({
  markers,
  isLoading,
  labels,
  renderVehicleLink,
}: FleetMapViewProps) {
  return (
    <section className="relative min-h-0 flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-1000 flex justify-center p-3 md:justify-start md:p-4">
        <div className="pointer-events-auto max-w-md rounded-2xl border border-base-content/8 bg-base-200/70 px-4 py-3 shadow-lg backdrop-blur-xl">
          <h1 className="text-sm font-semibold tracking-tight">
            {labels.title()}
          </h1>
          <p className="mt-0.5 text-xs text-base-content/55">
            {isLoading
              ? labels.loading()
              : markers.length === 0
                ? labels.empty()
                : labels.vehiclesOnMap({ count: markers.length })}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-full items-center justify-center bg-base-300/40 text-sm text-base-content/50">
          {labels.loading()}
        </div>
      ) : (
        <div className="absolute inset-0">
          <CarsMap
            markers={markers}
            labels={labels}
            renderVehicleLink={renderVehicleLink}
          />
        </div>
      )}
    </section>
  )
}
