import { useI18nContext } from '@fuel-carrier/i18n/react'
import { formatVolume } from '@fuel-carrier/web-ui/cars'
import { getFuelLevelColor } from '@fuel-carrier/web-ui/map'
import { CAR_CARD_TOTAL_CAPACITY_LITERS } from './car-card-utils'

type CarCardFuelSectionProps = {
  remainFuel: number | null
  fillPercent: number | null
}

export function CarCardFuelSection({
  remainFuel,
  fillPercent,
}: CarCardFuelSectionProps) {
  const { LL } = useI18nContext()
  const fuelColor = getFuelLevelColor(remainFuel)

  return (
    <div className="mt-1 space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
        <span>
          {remainFuel != null
            ? LL.externalPanel.home.fuelVolumeOfCapacity({
                volume: formatVolume(remainFuel),
                capacity: formatVolume(CAR_CARD_TOTAL_CAPACITY_LITERS),
                unit: LL.externalPanel.cars.tankUnit(),
              })
            : LL.externalPanel.cars.remainFuelUnknown()}
        </span>
        {fillPercent != null ? (
          <span style={{ color: fuelColor }}>{fillPercent}%</span>
        ) : null}
      </div>

      {remainFuel != null && fillPercent != null ? (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-base-content/8"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={CAR_CARD_TOTAL_CAPACITY_LITERS}
          aria-valuenow={remainFuel}
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
