import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import type { ReactNode } from 'react'
import { cn } from '../utils'
import { CarsMap, type CarsMapLabels } from './CarsMap'
import {
  CompanyColorLegend,
  type CompanyColorLegendItem,
} from './CompanyColorLegend'
import { useCompanyColors } from './company-colors'

export type FleetMapViewLabels = CarsMapLabels & {
  title: () => string
  loading: () => string
  empty: () => string
  vehiclesOnMap: (params: { count: number }) => string
  companyLegend?: () => string
  unnamedCompany?: () => string
}

export type FleetMapViewProps = {
  markers: CarTelemetryMarker[]
  isLoading: boolean
  labels: FleetMapViewLabels
  renderVehicleLink: (marker: CarTelemetryMarker) => ReactNode
  /** When set, replaces the default `flex-1` fill (e.g. dashboard embed). */
  className?: string
  /** Heading level for the overlay title. Defaults to `h1` (standalone map page). */
  titleAs?: 'h1' | 'h2'
  /** Color markers by company and show a legend. Internal fleet map only. */
  colorByCompany?: boolean
}

export function FleetMapView({
  markers,
  isLoading,
  labels,
  renderVehicleLink,
  className,
  titleAs = 'h1',
  colorByCompany = false,
}: FleetMapViewProps) {
  const TitleTag = titleAs
  const companyColors = useCompanyColors(
    colorByCompany
      ? markers.map(function toCompanyId(marker) {
          return marker.companyId
        })
      : [],
  )
  const legendItems = colorByCompany
    ? toCompanyLegendItems(
        markers,
        companyColors,
        labels.unnamedCompany?.() ?? '',
      )
    : []

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

      {colorByCompany && labels.companyLegend ? (
        <CompanyColorLegend
          title={labels.companyLegend()}
          items={legendItems}
        />
      ) : null}

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
            companyColors={colorByCompany ? companyColors : undefined}
          />
        </div>
      )}
    </section>
  )
}

function toCompanyLegendItems(
  markers: CarTelemetryMarker[],
  companyColors: ReadonlyMap<string, string>,
  unnamedCompany: string,
): CompanyColorLegendItem[] {
  const itemsByCompanyId = new Map<string, CompanyColorLegendItem>()

  for (const marker of markers) {
    if (itemsByCompanyId.has(marker.companyId)) {
      continue
    }

    const color = companyColors.get(marker.companyId)
    if (!color) {
      continue
    }

    const name = marker.companyName?.trim() || unnamedCompany || marker.companyId
    itemsByCompanyId.set(marker.companyId, {
      companyId: marker.companyId,
      name,
      color,
    })
  }

  return [...itemsByCompanyId.values()].sort(function compareCompanyName(a, b) {
    return a.name.localeCompare(b.name)
  })
}
