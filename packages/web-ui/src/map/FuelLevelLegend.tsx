import { FUEL_LEVEL_COLORS, type FuelLevel } from './fuel-level'

export type FuelLevelLegendLabels = {
  fuelLevelLegend: () => string
  fuelLevelHigh: () => string
  fuelLevelMidHigh: () => string
  fuelLevelMidLow: () => string
  fuelLevelLow: () => string
  fuelLevelUnknown: () => string
}

type FuelLevelLegendProps = {
  labels: FuelLevelLegendLabels
}

const LEGEND_LEVELS: FuelLevel[] = [
  'high',
  'midHigh',
  'midLow',
  'low',
  'unknown',
]

export function FuelLevelLegend({ labels }: FuelLevelLegendProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 z-1000 flex justify-end p-3 md:bottom-4 md:p-4">
      <aside
        aria-label={labels.fuelLevelLegend()}
        className="pointer-events-auto max-w-full rounded-2xl border border-base-content/8 bg-base-200/70 px-3 py-2.5 shadow-lg backdrop-blur-xl sm:px-4"
      >
        <ul className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
          {LEGEND_LEVELS.map(function renderLegendItem(level) {
            return (
              <li
                key={level}
                className="flex items-center gap-2 text-xs text-base-content/70"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full ring-2 ring-base-100"
                  style={{ backgroundColor: FUEL_LEVEL_COLORS[level] }}
                  aria-hidden
                />
                <span className="whitespace-nowrap">
                  {fuelLevelLabel(level, labels)}
                </span>
              </li>
            )
          })}
        </ul>
      </aside>
    </div>
  )
}

function fuelLevelLabel(
  level: FuelLevel,
  labels: FuelLevelLegendLabels,
): string {
  if (level === 'high') {
    return labels.fuelLevelHigh()
  }

  if (level === 'midHigh') {
    return labels.fuelLevelMidHigh()
  }

  if (level === 'midLow') {
    return labels.fuelLevelMidLow()
  }

  if (level === 'low') {
    return labels.fuelLevelLow()
  }

  return labels.fuelLevelUnknown()
}

export function hasFuelLevelLegendLabels(
  labels: Partial<FuelLevelLegendLabels>,
): labels is FuelLevelLegendLabels {
  return (
    typeof labels.fuelLevelLegend === 'function' &&
    typeof labels.fuelLevelHigh === 'function' &&
    typeof labels.fuelLevelMidHigh === 'function' &&
    typeof labels.fuelLevelMidLow === 'function' &&
    typeof labels.fuelLevelLow === 'function' &&
    typeof labels.fuelLevelUnknown === 'function'
  )
}
