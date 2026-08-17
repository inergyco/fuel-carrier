import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { useState, type ReactNode } from 'react'
import { cn } from '../utils'
import { CarsMap, type CarsMapLabels } from './CarsMap'
import { CompanyColorLegend } from './CompanyColorLegend'
import { useCompanyColors } from './company-colors'
import {
  applyCompanyFilter,
  fleetMapStatusLabel,
  toCompanyLegendItems,
} from './company-legend'

export type FleetMapViewLabels = CarsMapLabels & {
  title: () => string
  loading: () => string
  empty: () => string
  vehiclesOnMap: (params: { count: number }) => string
  companyLegend?: () => string
  unnamedCompany?: () => string
  showAllCompanies?: () => string
  vehiclesOnMapForCompany?: (params: {
    count: number
    company: string
  }) => string
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
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
  const { activeCompanyId, selectedCompanyName, visibleMarkers } =
    applyCompanyFilter(markers, legendItems, selectedCompanyId)

  function handleSelectCompany(companyId: string) {
    setSelectedCompanyId(function toggleCompany(current) {
      return current === companyId ? null : companyId
    })
  }

  function handleShowAllCompanies() {
    setSelectedCompanyId(null)
  }

  return (
    <section
      className={cn('relative min-h-0 overflow-hidden', className ?? 'flex-1')}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-1000 flex justify-center p-3 md:justify-start md:p-4">
        <div className="pointer-events-auto max-w-md rounded-2xl border border-base-content/8 bg-base-200/70 px-4 py-3 shadow-lg backdrop-blur-xl">
          <TitleTag className="text-sm font-semibold tracking-tight">
            {labels.title()}
          </TitleTag>
          <p className="mt-0.5 text-xs text-base-content/55">
            {fleetMapStatusLabel(
              isLoading,
              visibleMarkers.length,
              selectedCompanyName,
              labels,
            )}
          </p>
        </div>
      </div>

      {colorByCompany && labels.companyLegend && labels.showAllCompanies ? (
        <CompanyColorLegend
          title={labels.companyLegend()}
          showAllLabel={labels.showAllCompanies()}
          items={legendItems}
          selectedCompanyId={activeCompanyId}
          onSelectCompany={handleSelectCompany}
          onShowAll={handleShowAllCompanies}
        />
      ) : null}

      {isLoading ? (
        <div className="flex h-full items-center justify-center bg-base-300/40 text-sm text-base-content/50">
          {labels.loading()}
        </div>
      ) : (
        <div className="absolute inset-0">
          <CarsMap
            markers={visibleMarkers}
            labels={labels}
            renderVehicleLink={renderVehicleLink}
            companyColors={colorByCompany ? companyColors : undefined}
          />
        </div>
      )}
    </section>
  )
}
