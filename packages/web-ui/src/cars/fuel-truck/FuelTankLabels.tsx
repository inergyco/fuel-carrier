import {
  formatVolume,
  getTruckArtMetrics,
  getVisibleTankSlots,
} from './layout'

export type FuelTankLabelsProps = {
  filled: number[]
  unitLabel?: string
}

export function FuelTankLabels({ filled, unitLabel }: FuelTankLabelsProps) {
  const slots = getVisibleTankSlots(filled)
  const art = getTruckArtMetrics(filled.length)

  if (slots.length === 0) {
    return null
  }

  return (
    <ul className="pointer-events-none absolute inset-0">
      {slots.map(function renderLabel(slot) {
        const leftPercent =
          ((slot.cx - art.viewBoxX) / art.viewBoxWidth) * 100
        const topPercent =
          ((slot.cy - slot.ry - art.viewBoxY) / art.viewBoxHeight) * 100 - 2
        const label = `${formatVolume(slot.filled)}${unitLabel ? ` ${unitLabel}` : ''}`

        return (
          <li
            key={`tank-label-${slot.index}`}
            className="absolute -translate-x-1/2 -translate-y-full pb-1 text-center"
            style={{ left: `${leftPercent}%`, top: `${topPercent + -2.5}%` }}
          >
            <p className="text-[8px] sm:text-xs leading-tight font-medium whitespace-nowrap tabular-nums text-base-content/75">
              {label}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
