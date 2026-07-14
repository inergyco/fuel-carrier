import { useId } from 'react'
import { cn } from '@fuel-carrier/web-ui/utils'
import { FuelTankBank } from './FuelTankBank'
import { FuelTankLabels } from './FuelTankLabels'
import { FuelTruckGradients } from './FuelTruckGradients'
import { TruckCab } from './TruckCab'
import { TruckChassis } from './TruckChassis'
import { formatVolume, VIEWBOX_HEIGHT, VIEWBOX_WIDTH } from './layout'

export type FuelTruckDiagramProps = {
  /** Shared max volume for every visible tank. */
  capacity: number
  /**
   * Current liquid volume per tank (1–3 entries).
   * Extra entries are ignored; fewer hide unused tanks.
   */
  filled: number[]
  unitLabel?: string
  /** Label for the shared capacity line, e.g. "Capacity per tank: {volume}". */
  capacityLabel?: string
  className?: string
}

export function FuelTruckDiagram({
  capacity,
  filled,
  unitLabel,
  capacityLabel,
  className,
}: FuelTruckDiagramProps) {
  const reactId = useId().replace(/:/g, '')
  const metalGradientId = `${reactId}-metal`
  const liquidGradientId = `${reactId}-liquid`
  const shineGradientId = `${reactId}-shine`
  const chassisGradientId = `${reactId}-chassis`

  const volumeText = `${formatVolume(capacity)}${unitLabel ? ` ${unitLabel}` : ''}`
  const sharedCapacity =
    capacityLabel ?? `Capacity per tank: ${volumeText}`

  return (
    <figure
      className={cn(
        'relative w-full overflow-x-hidden rounded-2xl border border-base-content/8 bg-base-100/20 p-2 backdrop-blur-sm sm:p-4 md:p-5',
        className,
      )}
    >
      <p className="mb-2 text-center text-xs font-medium tabular-nums text-base-content/55 sm:text-sm">
        {sharedCapacity}
      </p>

      {/* pt leaves room for HTML fill labels above the tank bodies */}
      <div className="relative mx-auto w-full max-w-3xl pt-5 sm:pt-6">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          role="img"
          aria-label="Fuel carrier truck side view"
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto block h-auto w-full max-h-[min(42vw,280px)] min-h-[140px] sm:max-h-[320px]"
        >
          <FuelTruckGradients
            metalGradientId={metalGradientId}
            liquidGradientId={liquidGradientId}
            shineGradientId={shineGradientId}
            chassisGradientId={chassisGradientId}
          />

          <g className="text-base-content">
            <TruckChassis chassisGradientId={chassisGradientId} />
            <TruckCab />
            <FuelTankBank
              capacity={capacity}
              filled={filled}
              idPrefix={reactId}
              metalGradientId={metalGradientId}
              liquidGradientId={liquidGradientId}
              shineGradientId={shineGradientId}
            />
          </g>
        </svg>

        <div className="absolute inset-x-0 top-5 bottom-0 sm:top-6">
          <FuelTankLabels filled={filled} unitLabel={unitLabel} />
        </div>
      </div>
    </figure>
  )
}
