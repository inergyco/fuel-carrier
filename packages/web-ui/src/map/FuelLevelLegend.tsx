import type { FuelLevel } from './fuel-level'
import { FUEL_LEVEL_COLORS } from './fuel-level'
import { cn } from '../utils'

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
  selectedLevel: FuelLevel | null
  onSelectLevel: (level: FuelLevel) => void
}

const LEGEND_LEVELS: FuelLevel[] = [
  'high',
  'midHigh',
  'midLow',
  'low',
  'unknown',
]

export function FuelLevelLegend({
  labels,
  selectedLevel,
  onSelectLevel,
}: FuelLevelLegendProps) {
  const hasFilter = selectedLevel != null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1000 flex justify-end ltr:justify-start">
      <aside
        aria-label={labels.fuelLevelLegend()}
        className="pointer-events-auto max-w-full rounded-tr-xl border-t border-r border-base-content/8 bg-panel-card/90 px-2 py-1.5 shadow-sm backdrop-blur-xl sm:px-2.5"
      >
        <ul className="flex flex-wrap items-center justify-start gap-x-0.5 gap-y-0.5">
          {LEGEND_LEVELS.map(function renderLegendItem(level) {
            const isSelected = level === selectedLevel

            return (
              <li key={level}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectLevel(level)}
                  className={legendItemClassName(isSelected, hasFilter)}
                >
                  <span
                    className="size-2 shrink-0 rounded-full ring-1 ring-base-100"
                    style={{ backgroundColor: FUEL_LEVEL_COLORS[level] }}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">
                    {fuelLevelLabel(level, labels)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>
    </div>
  )
}

function legendItemClassName(isSelected: boolean, hasFilter: boolean): string {
  const base =
    'inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] leading-none transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40'

  if (isSelected) {
    return cn(base, 'bg-base-content/8 text-base-content')
  }

  if (hasFilter) {
    return cn(
      base,
      'text-base-content/35 hover:bg-base-content/5 hover:text-base-content/65',
    )
  }

  return cn(
    base,
    'text-base-content/55 hover:bg-base-content/5 hover:text-base-content/80',
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
