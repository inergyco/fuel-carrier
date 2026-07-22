import type { CarLocationMarker } from '@fuel-carrier/shared-types'
import type { ReactNode } from 'react'
import { cn } from '../utils'
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
  /** When set, replaces the default `flex-1` fill (e.g. dashboard embed). */
  className?: string
  /** Heading level for the overlay title. Defaults to `h1` (standalone map page). */
  titleAs?: 'h1' | 'h2'
}

export function FleetMapView({
  markers,
  isLoading,
  labels,
  renderVehicleLink,
  className,
  titleAs = 'h1',
}: FleetMapViewProps) {
  const TitleTag = titleAs

  return (
    <section
      className={cn(
        'relative min-h-0 overflow-hidden',
        className ?? 'flex-1',
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-1000 flex justify-center p-3 md:justify-start md:p-4">
        <div className="pointer-events-auto max-w-md rounded-2xl border border-base-content/8 bg-base-200/70 px-4 py-3 shadow-lg backdrop-blur-xl">
          <TitleTag className="text-sm font-semibold tracking-tight">
            {labels.title()}
          </TitleTag>
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
