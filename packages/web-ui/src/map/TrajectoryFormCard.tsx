import { Button, LocalizedDateTimeRangePicker } from '../ui'
import type { TrajectoryMapViewLabels } from './trajectory-map.types'

const overlayCardClassName =
  'pointer-events-auto rounded-2xl border border-base-content/8 bg-base-200/70 shadow-lg backdrop-blur-xl'

type TrajectoryFormCardProps = {
  labels: TrajectoryMapViewLabels
  isHistoryMode: boolean
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

export function TrajectoryFormCard({
  labels,
  isHistoryMode,
  vehicleLabel,
  startAt,
  endAt,
  canSubmit,
  isSubmitting,
  onRangeChange,
  onShowTrajectory,
  onBackToLiveMap,
  onClearSelection,
}: TrajectoryFormCardProps) {
  return (
    <div
      className={`${overlayCardClassName} w-full min-w-0 max-w-full px-3 py-2.5 md:w-fit`}
    >
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-3">
        <div className="inline-flex min-w-0 max-w-full flex-row flex-nowrap items-center gap-2">
          <span className="min-w-0 truncate rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium whitespace-nowrap text-primary">
            {vehicleLabel}
          </span>
          {!isHistoryMode ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onClearSelection}
              className="w-auto shrink-0 px-2 text-xs whitespace-nowrap normal-case tracking-normal"
            >
              {labels.changeVehicle()}
            </Button>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <LocalizedDateTimeRangePicker
            compact
            className="w-full min-w-0 sm:min-w-[18rem] xl:w-[22rem]"
            label={`${labels.startDateTime()} – ${labels.endDateTime()}`}
            value={{ start: startAt, end: endAt }}
            onChange={onRangeChange}
            placeholder={labels.dateTimePlaceholder()}
            disabled={isHistoryMode}
          />

          {isHistoryMode ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToLiveMap}
              className="h-11 min-h-11 w-full shrink-0 rounded-lg border border-base-content/10 bg-base-100/40 px-3 sm:w-auto"
            >
              {labels.backToLiveMap()}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onShowTrajectory}
              disabled={!canSubmit}
              loading={isSubmitting}
              loadingText={labels.showTrajectoryLoading()}
              className="h-11 min-h-11 w-full shrink-0 sm:w-auto sm:min-w-28"
            >
              {labels.showTrajectory()}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
