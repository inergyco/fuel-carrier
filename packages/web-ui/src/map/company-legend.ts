import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import type { CompanyColorLegendItem } from './CompanyColorLegend'

type FleetMapStatusLabels = {
  loading: () => string
  empty: () => string
  vehiclesOnMap: (params: { count: number }) => string
  vehiclesOnMapForCompany?: (params: {
    count: number
    company: string
  }) => string
}

export function toCompanyLegendItems(
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

export function applyCompanyFilter(
  markers: CarTelemetryMarker[],
  legendItems: CompanyColorLegendItem[],
  selectedCompanyId: string | null,
): {
  activeCompanyId: string | null
  selectedCompanyName: string | null
  visibleMarkers: CarTelemetryMarker[]
} {
  const isPresent = legendItems.some(function hasCompany(item) {
    return item.companyId === selectedCompanyId
  })
  const activeCompanyId = isPresent ? selectedCompanyId : null
  const selectedCompanyName =
    legendItems.find(function matchSelected(item) {
      return item.companyId === activeCompanyId
    })?.name ?? null
  const visibleMarkers =
    activeCompanyId == null
      ? markers
      : markers.filter(function bySelectedCompany(marker) {
          return marker.companyId === activeCompanyId
        })

  return { activeCompanyId, selectedCompanyName, visibleMarkers }
}

export function fleetMapStatusLabel(
  isLoading: boolean,
  visibleCount: number,
  selectedCompanyName: string | null,
  labels: FleetMapStatusLabels,
): string {
  if (isLoading) {
    return labels.loading()
  }

  if (visibleCount === 0) {
    return labels.empty()
  }

  if (selectedCompanyName && labels.vehiclesOnMapForCompany) {
    return labels.vehiclesOnMapForCompany({
      count: visibleCount,
      company: selectedCompanyName,
    })
  }

  return labels.vehiclesOnMap({ count: visibleCount })
}
