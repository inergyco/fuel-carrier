import type { CarCardMotionStatus } from './car-card-utils'
import { getMotionStatusDotClass } from './car-card-utils'

type CarCardHeaderProps = {
  licensePlate: string
  status: CarCardMotionStatus
  statusLabel: string
}

export function CarCardHeader({
  licensePlate,
  status,
  statusLabel,
}: CarCardHeaderProps) {
  return (
    <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-4">
      <div className="min-w-0">
        <p className="truncate font-mono text-base font-semibold tracking-tight text-base-content">
          {licensePlate}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-base-content/55">
          <span
            aria-hidden
            className={`size-2 shrink-0 rounded-full ${getMotionStatusDotClass(status)}`}
          />
          {statusLabel}
        </p>
      </div>
    </div>
  )
}
