import {
  formatVolume,
  getVisibleTankSlots,
  TANK_LABEL_Y,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
} from './layout'

export type FuelTankLabelsProps = {
  filled: number[]
  unitLabel?: string
}

/**
 * HTML fill labels aligned to tank centers. Capacity is shown once elsewhere
 * (shared across tanks). CSS font sizes keep text readable on mobile.
 */
export function FuelTankLabels({ filled, unitLabel }: FuelTankLabelsProps) {
  const slots = getVisibleTankSlots(filled)

  if (slots.length === 0) {
    return null
  }

  return (
    <ul className="pointer-events-none absolute inset-0">
      {slots.map(function renderLabel(slot) {
        const leftPercent = (slot.cx / VIEWBOX_WIDTH) * 100
        const topPercent = (TANK_LABEL_Y / VIEWBOX_HEIGHT) * 100
        const label = `${formatVolume(slot.filled)}${unitLabel ? ` ${unitLabel}` : ''}`

        return (
          <li
            key={`tank-label-${slot.index}`}
            className="absolute max-w-[32%] -translate-x-1/2 -translate-y-full px-0.5 text-center"
            style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
          >
            <p className="text-xs leading-tight font-medium tabular-nums text-base-content/70 sm:text-xs md:text-sm">
              {label}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
