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
 */
export function FuelTank({ id, cx, capacity, filled }: FuelTankProps) {
  const ratio = clampFillRatio(capacity, filled)
  const tankTop = TANK_CY - TANK_RADIUS
  const tankBottom = TANK_CY + TANK_RADIUS
  const liquidHeight = TANK_DIAMETER * ratio
  const liquidTop = tankBottom - liquidHeight
  const flangeTop = tankTop - 14
  const clipId = `${id}-liquid-clip`
  const innerRadius = TANK_RADIUS - 2

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={TANK_CY} r={innerRadius} />
        </clipPath>
      </defs>

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
          fill="#0d9488"
        />
        {ratio > 0.02 ? (
          <ellipse
            cx={cx}
            cy={liquidTop + 1}
            rx={innerRadius - 2}
            ry={3}
            fill="#14b8a6"
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
        x={cx - 4}
        y={tankBottom - 1}
        width={8}
        height={MANIFOLD_Y - tankBottom + 8}
        rx={2}
        fill="#64748b"
        stroke="#475569"
        strokeWidth={1}
      />
      <circle
        cx={cx}
        cy={MANIFOLD_Y + 4}
        r={5}
        fill="#94a3b8"
        stroke="#475569"
        strokeWidth={1.5}
      />
    </g>
  )
}
