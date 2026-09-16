import type { TrajectoryMapViewLabels } from './trajectory-map.types'

const overlayCardClassName =
  'pointer-events-auto rounded-2xl border border-base-content/8 bg-base-200/70 shadow-lg backdrop-blur-xl'

type TrajectoryStatusCardProps = {
  labels: TrajectoryMapViewLabels
  titleAs: 'h1' | 'h2'
  statusText: string
}

export function TrajectoryStatusCard({
  labels,
  titleAs,
  statusText,
}: TrajectoryStatusCardProps) {
  const TitleTag = titleAs

  return (
    <div
      className={`${overlayCardClassName} w-fit max-w-[min(100%,20rem)] px-3 py-2`}
    >
      <TitleTag className="text-sm font-semibold tracking-tight">
        {labels.title()}
      </TitleTag>
      <p className="text-xs text-base-content/55">{statusText}</p>
    </div>
  )
}
