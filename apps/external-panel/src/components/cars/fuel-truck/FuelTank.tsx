import {
  clampFillRatio,
  MANIFOLD_Y,
  TANK_CY,
  TANK_DIAMETER,
  TANK_RADIUS,
} from './layout'

export type FuelTankProps = {
  id: string
  cx: number
  capacity: number
  filled: number
}

/**
 * Circular tank face with top flange.
 * Liquid fill is clipped to the tank circle so it never bleeds outside.
 * Manifold junction uses a consistent downward flow icon (tank → pipe).
 */
export function FuelTank({ id, cx, capacity, filled }: FuelTankProps) {
  const ratio = clampFillRatio(capacity, filled)
  const tankTop = TANK_CY - TANK_RADIUS
  const tankBottom = TANK_CY + TANK_RADIUS
  const liquidHeight = TANK_DIAMETER * ratio
  const liquidTop = tankBottom - liquidHeight
  const flangeTop = tankTop - 14
  const clipId = `${id}-liquid-clip`
  const glowId = `${id}-liquid-glow`
  const innerRadius = TANK_RADIUS - 2
  const junctionY = MANIFOLD_Y + 4

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={TANK_CY} r={innerRadius} />
        </clipPath>
        <radialGradient id={glowId} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity={0.95} />
          <stop offset="55%" stopColor="#14b8a6" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#0f766e" stopOpacity={0.95} />
        </radialGradient>
      </defs>

      <circle
        cx={cx}
        cy={TANK_CY}
        r={TANK_RADIUS + 3}
        fill="none"
        stroke="color-mix(in oklab, var(--color-primary) 22%, transparent)"
        strokeWidth={4}
        opacity={ratio > 0 ? 0.9 : 0.25}
      />

      <circle
        cx={cx}
        cy={TANK_CY}
        r={TANK_RADIUS}
        fill="#cbd5e1"
        stroke="#334155"
        strokeWidth={2.5}
      />

      <g clipPath={`url(#${clipId})`}>
        <rect
          x={cx - innerRadius}
          y={liquidTop}
          width={innerRadius * 2}
          height={liquidHeight}
          fill={`url(#${glowId})`}
        />
        {ratio > 0.02 ? (
          <ellipse
            cx={cx}
            cy={liquidTop + 1}
            rx={innerRadius - 2}
            ry={3.5}
            fill="#99f6e4"
            opacity={0.85}
          />
        ) : null}
      </g>

      <circle
        cx={cx}
        cy={TANK_CY}
        r={TANK_RADIUS}
        fill="none"
        stroke="#64748b"
        strokeWidth={1}
        opacity={0.45}
      />

      <rect
        x={cx - 7}
        y={flangeTop + 6}
        width={14}
        height={10}
        rx={2}
        fill="#94a3b8"
        stroke="#475569"
        strokeWidth={1}
      />
      <ellipse
        cx={cx}
        cy={flangeTop + 4}
        rx={14}
        ry={6}
        fill="#e2e8f0"
        stroke="#475569"
        strokeWidth={1.5}
      />

      <rect
        x={cx - 3.5}
        y={tankBottom - 1}
        width={7}
        height={junctionY - tankBottom - 2}
        rx={2}
        fill="#64748b"
        stroke="#475569"
        strokeWidth={1}
      />

      {/* Consistent down-flow marker: tank drains into the shared manifold. */}
      <circle
        cx={cx}
        cy={junctionY}
        r={7}
        fill="#0f172a"
        stroke="color-mix(in oklab, var(--color-primary) 55%, #94a3b8)"
        strokeWidth={1.5}
      />
      <path
        d={`M ${cx - 3.2} ${junctionY - 1.6} L ${cx} ${junctionY + 2.4} L ${cx + 3.2} ${junctionY - 1.6} Z`}
        fill="color-mix(in oklab, var(--color-primary) 85%, white)"
      />
    </g>
  )
}
