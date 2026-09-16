import { Button } from '../ui'
import type { TrajectoryMapViewLabels } from './trajectory-map.types'

const overlayCardClassName =
  'pointer-events-auto rounded-2xl border border-base-content/8 bg-base-200/70 shadow-lg backdrop-blur-xl'

type TrajectoryStatusCardProps = {
  labels: TrajectoryMapViewLabels
  titleAs: 'h1' | 'h2'
  statusText: string
  isPlanningRoute: boolean
  onStartPlanning: () => void
  onBackToLiveMap: () => void
}

export function TrajectoryStatusCard({
  labels,
  titleAs,
  statusText,
  isPlanningRoute,
  onStartPlanning,
  onBackToLiveMap,
}: TrajectoryStatusCardProps) {
  const TitleTag = titleAs

  return (
    <div
      className={`${overlayCardClassName} flex w-fit max-w-[min(100%,22rem)] flex-col gap-2 px-3 py-2.5`}
    >
      <div>
        <TitleTag className="text-sm font-semibold tracking-tight">
          {labels.title()}
        </TitleTag>
        <p className="text-xs text-base-content/55">{statusText}</p>
      </div>
      {isPlanningRoute ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBackToLiveMap}
          className="h-11 min-h-11 w-full rounded-lg border border-base-content/10 bg-base-100/40 px-3"
        >
          {labels.backToLiveMap()}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={onStartPlanning}
          className="h-11 min-h-11 w-full"
        >
          {labels.historyRoute()}
        </Button>
      )}
    </div>
  )
}
