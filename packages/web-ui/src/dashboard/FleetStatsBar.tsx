import type { CarFleetStats } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Car, Droplets, Fuel, type LucideIcon } from '../icons'
import { FUEL_LEVEL_COLORS } from '../map'
import { ICON_STROKE_WIDTH } from '../ui/iconClassName'
import { cn } from '../utils'

type FleetStatsBarProps = {
  stats: CarFleetStats
  className?: string
}

type StatTone = 'primary' | 'success' | 'info' | 'warning' | 'error' | 'accent'

type StatItem = {
  key: string
  label: string
  value: number
  tone: StatTone
  Icon: LucideIcon
  swatch?: string
}

export function FleetStatsBar({ stats, className }: FleetStatsBarProps) {
  const { LL } = useI18nContext()
  const labels = LL.common.fleetStats

  const items: StatItem[] = [
    {
      key: 'total',
      label: labels.totalCars(),
      value: stats.totalCars,
      tone: 'primary',
      Icon: Car,
    },
    {
      key: 'fuel-high',
      label: labels.fuelHigh(),
      value: stats.fuelHigh,
      tone: 'success',
      swatch: FUEL_LEVEL_COLORS.high,
      Icon: Fuel,
    },
    {
      key: 'fuel-mid-high',
      label: labels.fuelMidHigh(),
      value: stats.fuelMidHigh,
      tone: 'info',
      swatch: FUEL_LEVEL_COLORS.midHigh,
      Icon: Fuel,
    },
    {
      key: 'fuel-mid-low',
      label: labels.fuelMidLow(),
      value: stats.fuelMidLow,
      tone: 'warning',
      swatch: FUEL_LEVEL_COLORS.midLow,
      Icon: Fuel,
    },
    {
      key: 'fuel-low',
      label: labels.fuelLow(),
      value: stats.fuelLow,
      tone: 'error',
      swatch: FUEL_LEVEL_COLORS.low,
      Icon: Fuel,
    },
    {
      key: 'high-grade',
      label: labels.highGrade(),
      value: stats.highGrade,
      tone: 'accent',
      Icon: Droplets,
    },
  ]

  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6',
        className,
      )}
    >
      {items.map(function renderStat(item) {
        const Icon = item.Icon

        return (
          <li key={item.key}>
            <article className="flex h-full items-center justify-between gap-3 rounded-2xl border border-base-content/8 bg-base-100/80 px-3.5 py-3 shadow-sm backdrop-blur-xl">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium tracking-tight text-base-content/50">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-base-content tabular-nums">
                  {item.value}
                </p>
              </div>
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full border',
                  toneClassName(item.tone),
                )}
                style={
                  item.swatch
                    ? {
                        color: item.swatch,
                        borderColor: `color-mix(in oklab, ${item.swatch} 35%, transparent)`,
                        backgroundColor: `color-mix(in oklab, ${item.swatch} 12%, transparent)`,
                      }
                    : undefined
                }
                aria-hidden
              >
                <Icon className="size-4" strokeWidth={ICON_STROKE_WIDTH} />
              </span>
            </article>
          </li>
        )
      })}
    </ul>
  )
}

function toneClassName(tone: StatTone): string {
  if (tone === 'success') {
    return 'border-success/35 bg-success/10 text-success'
  }

  if (tone === 'info') {
    return 'border-info/35 bg-info/10 text-info'
  }

  if (tone === 'warning') {
    return 'border-warning/35 bg-warning/10 text-warning'
  }

  if (tone === 'error') {
    return 'border-error/35 bg-error/10 text-error'
  }

  if (tone === 'accent') {
    return 'border-accent/35 bg-accent/10 text-accent'
  }

  return 'border-primary/35 bg-primary/10 text-primary'
}
