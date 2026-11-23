import { clampFillRatio } from './layout'

export type FuelTankProps = {
  id: string
  cx: number
  cy: number
  rx: number
  ry: number
  /** Corner radius. Semicircular ends when omitted. */
  endRx?: number
  capacity: number
  filled: number
}

/** Liquid only — the tank outline lives in the schematic artwork. */
export function FuelTank({
  id,
  cx,
  cy,
  rx,
  ry,
  endRx,
  capacity,
  filled,
}: FuelTankProps) {
  const ratio = clampFillRatio(capacity, filled)
  if (ratio <= 0) {
    return null
  }

  const tankTop = cy - ry
  const tankBottom = cy + ry
  const liquidHeight = ry * 2 * ratio
  const liquidTop = tankBottom - liquidHeight
  const clipId = `${id}-liquid-clip`
  const glowId = `${id}-liquid-glow`
  const isCapsule = rx > ry * 1.2

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          {isCapsule ? (
            <path
              d={capsulePath({
                cx,
                cy,
                rx,
                ry,
                endRx: endRx ?? ry,
              })}
            />
          ) : (
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
          )}
        </clipPath>
        <linearGradient id={glowId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity={0.95} />
          <stop offset="55%" stopColor="#14b8a6" stopOpacity={0.92} />
          <stop offset="100%" stopColor="#0f766e" stopOpacity={0.95} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect
          x={cx - rx}
          y={liquidTop}
          width={rx * 2}
          height={liquidHeight}
          fill={`url(#${glowId})`}
        />
        {ratio < 0.98 ? (
          <ellipse
            cx={cx}
            cy={liquidTop + 1}
            rx={Math.max(0, rx - (isCapsule ? 0 : 2))}
            ry={3}
            fill="#99f6e4"
            opacity={0.85}
          />
        ) : null}
        {/* Keep full-height fill flush against the roof when nearly full. */}
        {ratio >= 0.98 ? (
          <rect
            x={cx - rx}
            y={tankTop}
            width={rx * 2}
            height={2}
            fill="#99f6e4"
            opacity={0.35}
          />
        ) : null}
      </g>
    </g>
  )
}

/** Flat sides with rounded corners. `endRx === ry` is a semicircular end. */
function capsulePath(shape: {
  cx: number
  cy: number
  rx: number
  ry: number
  endRx: number
}) {
  const { cx, cy, rx, ry, endRx } = shape
  const left = cx - rx
  const right = cx + rx
  const top = cy - ry
  const bottom = cy + ry
  const radius = Math.min(endRx, rx, ry)

  return [
    `M ${left + radius} ${top}`,
    `H ${right - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right} ${top + radius}`,
    `V ${bottom - radius}`,
    `A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
    `H ${left + radius}`,
    `A ${radius} ${radius} 0 0 1 ${left} ${bottom - radius}`,
    `V ${top + radius}`,
    `A ${radius} ${radius} 0 0 1 ${left + radius} ${top}`,
    'Z',
  ].join(' ')
}
