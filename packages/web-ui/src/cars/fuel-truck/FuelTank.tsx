import { clampFillRatio } from './layout'

export type FuelTankProps = {
  id: string
  cx: number
  cy: number
  rx: number
  ry: number
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
            <path d={capsulePath(cx, cy, rx, ry)} />
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

/** Horizontal stadium: flat top/bottom with semicircular ends. */
function capsulePath(cx: number, cy: number, rx: number, ry: number) {
  const left = cx - rx
  const right = cx + rx
  const top = cy - ry
  const bottom = cy + ry
  const flatStart = left + ry
  const flatEnd = right - ry

  return [
    `M ${flatStart} ${top}`,
    `H ${flatEnd}`,
    `A ${ry} ${ry} 0 0 1 ${flatEnd} ${bottom}`,
    `H ${flatStart}`,
    `A ${ry} ${ry} 0 0 1 ${flatStart} ${top}`,
    'Z',
  ].join(' ')
}
