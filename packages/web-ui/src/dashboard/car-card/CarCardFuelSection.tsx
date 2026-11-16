import type { ReactNode } from 'react'
import { getFuelLevelColor } from '../../map'
import { formatFillPercent } from './car-card-utils'

type CarCardFuelSectionProps = {
  remainFuel: number | null
  fillPercent: number | null
  totalCapacityLiters: number
  remainFuelUnknown: string
  fuelVolumeLabel: ReactNode
}

export function CarCardFuelSection({
  remainFuel,
  fillPercent,
  totalCapacityLiters,
  remainFuelUnknown,
  fuelVolumeLabel,
}: CarCardFuelSectionProps) {
  const fuelColor = getFuelLevelColor(remainFuel, totalCapacityLiters)

  return (
    <div className="mt-1 space-y-1.5">
      <div
        dir="ltr"
        className="flex items-center justify-between gap-2 text-xs tabular-nums"
      >
        <span>{remainFuel != null ? fuelVolumeLabel : remainFuelUnknown}</span>
        {fillPercent != null ? (
          <span style={{ color: fuelColor }}>
            {formatFillPercent(fillPercent)}
          </span>
        ) : null}
      </div>

      {remainFuel != null && fillPercent != null ? (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-base-content/8"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={totalCapacityLiters}
          aria-valuenow={remainFuel}
          dir="ltr"
        >
          <div
            className="h-full rounded-full transition-[width,background-color] duration-500"
            style={{
              width: `${fillPercent}%`,
              backgroundColor: fuelColor,
            }}
          />
        </div>
      ) : (
        <div className="h-1.5 rounded-full bg-base-content/8" aria-hidden />
      )}
    </div>
  )
}
