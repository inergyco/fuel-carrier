import type { Car, CarTelemetryMarker } from '@fuel-carrier/shared-types'
import type { ReactNode } from 'react'
import type { KyInstance } from '../api'
import { cn } from '../utils'
import { CarsMap } from './CarsMap'
import {
  FuelLevelLegend,
  hasFuelLevelLegendLabels,
} from './FuelLevelLegend'
import { TrajectoryControls } from './TrajectoryControls'
import type { TrajectoryMapViewLabels } from './trajectory-map.types'
import { getVehicleLabel } from './trajectory-utils'
import { useTrajectoryHistory } from './useTrajectoryHistory'
import { useTrajectorySelection } from './useTrajectorySelection'

export type { TrajectoryMapViewLabels } from './trajectory-map.types'

export type TrajectoryMapViewProps = {
  api: KyInstance
  cars: Car[]
  markers: CarTelemetryMarker[]
  isLoading: boolean
  labels: TrajectoryMapViewLabels
  renderVehicleLink: (marker: CarTelemetryMarker) => ReactNode
  className?: string
}

export function TrajectoryMapView({
  api,
  cars,
  markers,
  isLoading,
  labels,
  renderVehicleLink,
  className,
}: TrajectoryMapViewProps) {
  const selection = useTrajectorySelection()
  const selectedCar = cars.find(function matchCar(car) {
    return car.id === selection.selectedCarId
  })
  const selectedLiveMarker =
    markers.find(function matchMarker(marker) {
      return marker.carId === selection.selectedCarId
    }) ?? null
  const history = useTrajectoryHistory({
    api,
    historyRequest: selection.historyRequest,
    selectedCar,
    selectedLiveMarker,
  })
  const vehicleLabel = getVehicleLabel({
    car: selectedCar,
    marker: selectedLiveMarker,
    fallback: labels.unnamedVehicle(),
  })
  const showFuelLegend =
    !isLoading &&
    !selection.isHistoryMode &&
    hasFuelLevelLegendLabels(labels)

  return (
    <section
      className={cn(
        'fuel-carrier-map-stage relative min-h-0 overflow-hidden',
        className ?? 'flex-1',
      )}
    >
      <TrajectoryControls
        labels={labels}
        isHistoryMode={selection.isHistoryMode}
        hasSelectedCar={selection.hasSelectedCar}
        vehicleLabel={vehicleLabel}
        startAt={selection.startAt}
        endAt={selection.endAt}
        canSubmit={selection.canSubmit}
        isSubmitting={history.isLoading}
        onRangeChange={selection.handleRangeChange}
        onShowTrajectory={selection.handleShowTrajectory}
        onBackToLiveMap={selection.handleBackToLiveMap}
        onClearSelection={selection.handleClearSelection}
      />

      {showFuelLegend ? <FuelLevelLegend labels={labels} /> : null}

      {isLoading ? (
        <div className="flex h-full items-center justify-center bg-base-300/40 text-sm text-base-content/50">
          {labels.loading()}
        </div>
      ) : (
        <div className="absolute inset-0">
          <CarsMap
            markers={resolveMapMarkers({
              isHistoryMode: selection.isHistoryMode,
              historyMarker: history.historyMarker,
              selectedLiveMarker,
              liveMarkers: markers,
            })}
            labels={labels}
            renderVehicleLink={renderVehicleLink}
            pathPoints={
              selection.isHistoryMode ? history.historyPathPoints : undefined
            }
            instantMarkerUpdates={selection.isHistoryMode}
            selectedCarId={selection.selectedCarId || null}
            onMarkerSelect={
              selection.isHistoryMode ? undefined : selection.handleSelectMarker
            }
          />
        </div>
      )}
    </section>
  )
}

function resolveMapMarkers({
  isHistoryMode,
  historyMarker,
  selectedLiveMarker,
  liveMarkers,
}: {
  isHistoryMode: boolean
  historyMarker: CarTelemetryMarker | null
  selectedLiveMarker: CarTelemetryMarker | null
  liveMarkers: CarTelemetryMarker[]
}): CarTelemetryMarker[] {
  if (!isHistoryMode) {
    return liveMarkers
  }

  if (historyMarker) {
    return [historyMarker]
  }

  if (selectedLiveMarker) {
    return [selectedLiveMarker]
  }

  return []
}
