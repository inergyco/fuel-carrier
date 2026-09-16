import { Button, LocalizedDateTimePicker } from '../ui'
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
  onStartChange: (value: Date | null) => void
  onEndChange: (value: Date | null) => void
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
  onStartChange,
  onEndChange,
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center">
          <LocalizedDateTimePicker
            compact
            className="w-full min-w-0 xl:w-[13.25rem]"
            label={labels.startDateTime()}
            value={startAt}
            onChange={onStartChange}
            placeholder={labels.dateTimePlaceholder()}
            maxDate={endAt ?? undefined}
            disabled={isHistoryMode}
          />

          <LocalizedDateTimePicker
            compact
            className="w-full min-w-0 xl:w-[13.25rem]"
            label={labels.endDateTime()}
            value={endAt}
            onChange={onEndChange}
            placeholder={labels.dateTimePlaceholder()}
            minDate={startAt ?? undefined}
            disabled={isHistoryMode}
          />

          {isHistoryMode ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToLiveMap}
              className="h-11 min-h-11 w-full rounded-lg border border-base-content/10 bg-base-100/40 px-3 sm:col-span-2 xl:w-auto"
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
              className="h-11 min-h-11 w-full sm:col-span-2 xl:w-auto xl:min-w-28"
            >
              {labels.showTrajectory()}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
