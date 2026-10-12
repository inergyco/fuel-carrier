import { Badge } from '../../ui/Badge'
import type { CarCardLiveness } from './car-card-utils'

type CarCardHeaderProps = {
  licensePlate: string
  liveness: CarCardLiveness
  statusLabel: string
  highGradeLabel?: string
}

export function CarCardHeader({
  licensePlate,
  liveness,
  statusLabel,
  highGradeLabel,
}: CarCardHeaderProps) {
  const isLive = liveness === 'live'

  return (
    <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-4">
      <div className="min-w-0">
        <p className="truncate font-mono text-base font-semibold tracking-tight text-base-content">
          {licensePlate}
        </p>
        <p
          className={`mt-1 inline-flex items-center gap-1.5 text-sm ${
            isLive ? 'text-success' : 'text-base-content/55'
          }`}
        >
          <span
            aria-hidden
            className={`size-2 shrink-0 rounded-full ${
              isLive ? 'bg-success' : 'bg-base-content/30'
            }`}
          />
          {statusLabel}
        </p>
      </div>

      {highGradeLabel ? (
        <Badge variant="info" size="md">
          {highGradeLabel}
        </Badge>
      ) : null}
    </div>
  )
}
