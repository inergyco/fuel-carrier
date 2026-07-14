import {
  clampFillRatio,
  LIQUID_INSET,
  MANIFOLD_Y,
  TANK_BODY_HEIGHT,
  TANK_BODY_TOP,
  TANK_RX,
  TANK_WIDTH,
} from './layout'

export type FuelTankProps = {
  /** Stable id used for SVG clipPath uniqueness. */
  id: string
  /** Tank center X in diagram viewBox coordinates. */
  cx: number
  /** Shared compartment capacity. */
  capacity: number
  /** Current filled volume (same unit as capacity). */
  filled: number
  metalGradientId: string
  liquidGradientId: string
  shineGradientId: string
}

/**
 * A single fuel compartment on the truck.
 * Domain state (capacity / filled) lives here so the UI can track tanks independently of the cab artwork.
 * Volume labels are rendered as HTML overlays (see FuelTankLabels) for mobile readability.
 */
export function FuelTank({
  id,
  cx,
  capacity,
  filled,
  metalGradientId,
  liquidGradientId,
  shineGradientId,
}: FuelTankProps) {
  const x = cx - TANK_WIDTH / 2
  const ratio = clampFillRatio(capacity, filled)
  const innerHeight = TANK_BODY_HEIGHT - LIQUID_INSET * 2
  const liquidHeight = innerHeight * ratio
  const liquidY = TANK_BODY_TOP + LIQUID_INSET + (innerHeight - liquidHeight)
  const clipId = `${id}-clip`

  return (
    <g data-tank-id={id}>
      <defs>
        <clipPath id={clipId}>
          <rect
            x={x + LIQUID_INSET}
            y={TANK_BODY_TOP + LIQUID_INSET}
            width={TANK_WIDTH - LIQUID_INSET * 2}
            height={TANK_BODY_HEIGHT - LIQUID_INSET * 2}
            rx={TANK_RX - 4}
          />
        </clipPath>
      </defs>

      <ellipse
        cx={cx}
        cy={TANK_BODY_TOP + 4}
        rx={TANK_WIDTH * 0.28}
        ry={10}
        className="fill-base-content/25 stroke-base-content/30"
        strokeWidth={1.5}
      />
      <rect
        x={cx - 8}
        y={TANK_BODY_TOP - 10}
        width={16}
        height={10}
        rx={3}
        className="fill-base-content/35 stroke-base-content/25"
        strokeWidth={1}
      />

      <rect
        x={x}
        y={TANK_BODY_TOP}
        width={TANK_WIDTH}
        height={TANK_BODY_HEIGHT}
        rx={TANK_RX}
        fill={`url(#${metalGradientId})`}
        className="stroke-base-content/35"
        strokeWidth={2}
      />

      <g clipPath={`url(#${clipId})`}>
        <rect
          x={x + LIQUID_INSET}
          y={liquidY}
          width={TANK_WIDTH - LIQUID_INSET * 2}
          height={liquidHeight}
          fill={`url(#${liquidGradientId})`}
          className="transition-all duration-500 ease-out"
        />
        {ratio > 0.02 ? (
          <ellipse
            cx={cx}
            cy={liquidY + 2}
            rx={(TANK_WIDTH - LIQUID_INSET * 2) / 2 - 1}
            ry={5}
            className="fill-primary/50"
          />
        ) : null}
      </g>

      <rect
        x={x + 8}
        y={TANK_BODY_TOP + 10}
        width={14}
        height={TANK_BODY_HEIGHT - 20}
        rx={7}
        fill={`url(#${shineGradientId})`}
        opacity={0.55}
      />
      <line
        x1={x + 6}
        y1={TANK_BODY_TOP + TANK_BODY_HEIGHT * 0.33}
        x2={x + TANK_WIDTH - 6}
        y2={TANK_BODY_TOP + TANK_BODY_HEIGHT * 0.33}
        className="stroke-base-content/20"
        strokeWidth={2}
      />
      <line
        x1={x + 6}
        y1={TANK_BODY_TOP + TANK_BODY_HEIGHT * 0.66}
        x2={x + TANK_WIDTH - 6}
        y2={TANK_BODY_TOP + TANK_BODY_HEIGHT * 0.66}
        className="stroke-base-content/20"
        strokeWidth={2}
      />

      <rect
        x={x}
        y={TANK_BODY_TOP}
        width={TANK_WIDTH}
        height={TANK_BODY_HEIGHT}
        rx={TANK_RX}
        className="fill-none stroke-base-content/15"
        strokeWidth={1}
      />

      <rect
        x={cx - 5}
        y={TANK_BODY_TOP + TANK_BODY_HEIGHT - 2}
        width={10}
        height={MANIFOLD_Y - (TANK_BODY_TOP + TANK_BODY_HEIGHT) + 6}
        rx={2}
        className="fill-base-content/45 stroke-base-content/30"
        strokeWidth={1}
      />
      <circle
        cx={cx}
        cy={MANIFOLD_Y + 4}
        r={6}
        className="fill-base-content/50 stroke-base-content/35"
        strokeWidth={1.5}
      />
    </g>
  )
}
