import { clampFillRatio } from './layout'

export type FuelTankProps = {
  id: string
  cx: number
  cy: number
  r: number
  capacity: number
  filled: number
}

/** Liquid only — the tank outline lives in the schematic artwork. */
export function FuelTank({ id, cx, cy, r, capacity, filled }: FuelTankProps) {
  const ratio = clampFillRatio(capacity, filled)
  if (ratio <= 0) {
    return null
  }

  const tankBottom = cy + r
  const liquidHeight = r * 2 * ratio
  const liquidTop = tankBottom - liquidHeight
  const clipId = `${id}-liquid-clip`
  const glowId = `${id}-liquid-glow`

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <radialGradient id={glowId} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity={0.95} />
          <stop offset="55%" stopColor="#14b8a6" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#0f766e" stopOpacity={0.95} />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect
          x={cx - r}
          y={liquidTop}
          width={r * 2}
          height={liquidHeight}
          fill={`url(#${glowId})`}
        />
        {ratio < 0.98 ? (
          <ellipse
            cx={cx}
            cy={liquidTop + 1}
            rx={r - 2}
            ry={4}
            fill="#99f6e4"
            opacity={0.85}
          />
        ) : null}
      </g>
    </g>
  )
}
