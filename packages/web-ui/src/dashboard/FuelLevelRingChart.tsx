import type { ReactNode } from 'react'
import type { CarFleetStats } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { FUEL_LEVEL_COLORS } from '../map'
import { cn } from '../utils'

type FuelLevelRingChartProps = {
  stats: CarFleetStats
  className?: string
}

type RingSegment = {
  key: string
  label: string
  value: number
  color: string
}

const RING_SIZE = 196
const RING_STROKE = 22
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function FuelLevelRingChart({
  stats,
  className,
}: FuelLevelRingChartProps) {
  const { LL } = useI18nContext()
  const labels = LL.common.fleetStats

  const segments: RingSegment[] = [
    {
      key: 'high',
      label: labels.fuelHigh(),
      value: stats.fuelHigh,
      color: FUEL_LEVEL_COLORS.high,
    },
    {
      key: 'midHigh',
      label: labels.fuelMidHigh(),
      value: stats.fuelMidHigh,
      color: FUEL_LEVEL_COLORS.midHigh,
    },
    {
      key: 'midLow',
      label: labels.fuelMidLow(),
      value: stats.fuelMidLow,
      color: FUEL_LEVEL_COLORS.midLow,
    },
    {
      key: 'low',
      label: labels.fuelLow(),
      value: stats.fuelLow,
      color: FUEL_LEVEL_COLORS.low,
    },
  ]

  const bandedTotal = segments.reduce(function sumValues(sum, segment) {
    return sum + segment.value
  }, 0)

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border border-base-content/8 bg-base-100/80 p-5 shadow-sm backdrop-blur-xl',
        className,
      )}
    >
      <h2 className="text-sm font-semibold tracking-tight text-base-content/80">
        {labels.fuelRingTitle()}
      </h2>

      <div className="relative mx-auto mt-5 flex size-49 shrink-0 items-center justify-center">
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="color-mix(in oklab, var(--color-base-content) 8%, transparent)"
            strokeWidth={RING_STROKE}
          />
          {bandedTotal > 0
            ? renderRingSegments(segments, bandedTotal)
            : null}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center px-8">
          <img
            src="/truck-card.png"
            alt=""
            className="h-14 w-auto object-contain"
            draggable={false}
          />
        </div>
      </div>

      {bandedTotal === 0 ? (
        <p className="mt-4 text-center text-xs text-base-content/45">
          {labels.fuelRingEmpty()}
        </p>
      ) : (
        <ul className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-2">
          {segments.map(function renderLegendItem(segment) {
            return (
              <li
                key={segment.key}
                className="flex items-center gap-1.5 text-[11px] text-base-content/55"
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden
                />
                {segment.label}
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}

function renderRingSegments(
  segments: RingSegment[],
  bandedTotal: number,
) {
  const arcs: ReactNode[] = []
  let dashOffset = 0

  for (const segment of segments) {
    if (segment.value <= 0) {
      continue
    }

    const arcLength = (segment.value / bandedTotal) * RING_CIRCUMFERENCE

    arcs.push(
      <circle
        key={segment.key}
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke={segment.color}
        strokeWidth={RING_STROKE}
        strokeLinecap="butt"
        strokeDasharray={`${arcLength} ${RING_CIRCUMFERENCE - arcLength}`}
        strokeDashoffset={-dashOffset}
      />,
    )

    dashOffset += arcLength
  }

  return arcs
}
