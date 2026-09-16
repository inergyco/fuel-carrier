import type { TrajectoryMapViewLabels } from './trajectory-map.types'
import { TrajectoryFormCard } from './TrajectoryFormCard'
import { TrajectoryStatusCard } from './TrajectoryStatusCard'

const overlayShellClassName =
  'pointer-events-none absolute inset-x-0 top-0 z-1000 flex justify-center p-2 pt-3 pl-14 md:justify-start md:p-3 md:pl-3'

type TrajectoryControlsProps = {
  labels: TrajectoryMapViewLabels
  titleAs: 'h1' | 'h2'
  statusText: string
  isHistoryMode: boolean
  isPlanningRoute: boolean
  hasSelectedCar: boolean
  vehicleLabel: string
  startAt: Date | null
  endAt: Date | null
  canSubmit: boolean
  isSubmitting: boolean
  onStartChange: (value: Date | null) => void
  onEndChange: (value: Date | null) => void
  onStartPlanning: () => void
  onShowTrajectory: () => void
  onBackToLiveMap: () => void
  onClearSelection: () => void
}

export function TrajectoryControls({
  labels,
  titleAs,
  statusText,
  isHistoryMode,
  isPlanningRoute,
  hasSelectedCar,
  vehicleLabel,
  startAt,
  endAt,
  canSubmit,
  isSubmitting,
  onStartChange,
  onEndChange,
  onStartPlanning,
  onShowTrajectory,
  onBackToLiveMap,
  onClearSelection,
}: TrajectoryControlsProps) {
  const showTrajectoryForm = hasSelectedCar || isHistoryMode

  return (
    <div className={overlayShellClassName}>
      {showTrajectoryForm ? (
        <TrajectoryFormCard
          labels={labels}
          isHistoryMode={isHistoryMode}
          vehicleLabel={vehicleLabel}
          startAt={startAt}
          endAt={endAt}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          onShowTrajectory={onShowTrajectory}
          onBackToLiveMap={onBackToLiveMap}
          onClearSelection={onClearSelection}
        />
      ) : (
        <TrajectoryStatusCard
          labels={labels}
          titleAs={titleAs}
          statusText={statusText}
          isPlanningRoute={isPlanningRoute}
          onStartPlanning={onStartPlanning}
          onBackToLiveMap={onBackToLiveMap}
        />
      )}
    </div>
  )
}
