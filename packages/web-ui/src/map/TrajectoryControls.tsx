import type { TrajectoryMapViewLabels } from './trajectory-map.types'
import { TrajectoryFormCard } from './TrajectoryFormCard'

const overlayShellClassName =
  'pointer-events-none absolute inset-x-0 top-0 z-1000 flex justify-center p-2 pl-14 md:justify-start md:p-3 md:pl-16'

type TrajectoryControlsProps = {
  labels: TrajectoryMapViewLabels
  isHistoryMode: boolean
  hasSelectedCar: boolean
  vehicleLabel: string
  startAt: Date | null
  endAt: Date | null
  canSubmit: boolean
  isSubmitting: boolean
  onRangeChange: (value: { start: Date | null; end: Date | null }) => void
  onShowTrajectory: () => void
  onBackToLiveMap: () => void
  onClearSelection: () => void
}

export function TrajectoryControls({
  labels,
  isHistoryMode,
  hasSelectedCar,
  vehicleLabel,
  startAt,
  endAt,
  canSubmit,
  isSubmitting,
  onRangeChange,
  onShowTrajectory,
  onBackToLiveMap,
  onClearSelection,
}: TrajectoryControlsProps) {
  const showTrajectoryForm = hasSelectedCar || isHistoryMode

  if (!showTrajectoryForm) {
    return null
  }

  return (
    <div className={overlayShellClassName}>
      <TrajectoryFormCard
        labels={labels}
        isHistoryMode={isHistoryMode}
        vehicleLabel={vehicleLabel}
        startAt={startAt}
        endAt={endAt}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        onRangeChange={onRangeChange}
        onShowTrajectory={onShowTrajectory}
        onBackToLiveMap={onBackToLiveMap}
        onClearSelection={onClearSelection}
      />
    </div>
  )
}
