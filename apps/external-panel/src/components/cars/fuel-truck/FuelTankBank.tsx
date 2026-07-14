import { FuelTank } from './FuelTank'
import { getVisibleTankSlots, MANIFOLD_Y } from './layout'

export type FuelTankBankProps = {
  /** Shared capacity for every visible compartment. */
  capacity: number
  /**
   * Filled volumes for 1–3 tanks.
   * Length decides how many compartments are shown.
   */
  filled: number[]
  idPrefix: string
  metalGradientId: string
  liquidGradientId: string
  shineGradientId: string
}

/**
 * App-facing tank group: capacity + per-tank levels drive which vessels render
 * and how full each one is. Visual cab/chassis stay separate from this state.
 */
export function FuelTankBank({
  capacity,
  filled,
  idPrefix,
  metalGradientId,
  liquidGradientId,
  shineGradientId,
}: FuelTankBankProps) {
  const slots = getVisibleTankSlots(filled)

  if (slots.length === 0) {
    return null
  }

  const manifoldStart = slots[0]!.cx - 8
  const manifoldEnd = slots[slots.length - 1]!.cx + 8

  return (
    <g data-tank-bank="">
      <rect
        x={manifoldStart}
        y={MANIFOLD_Y}
        width={manifoldEnd - manifoldStart}
        height={10}
        rx={5}
        className="fill-base-content/55 stroke-base-content/40"
        strokeWidth={1.5}
      />
      <rect
        x={manifoldStart + 4}
        y={MANIFOLD_Y + 2}
        width={manifoldEnd - manifoldStart - 8}
        height={3}
        rx={1}
        className="fill-base-content/25"
      />

      {slots.map(function renderTank(slot) {
        return (
          <FuelTank
            key={`${idPrefix}-tank-${slot.index}`}
            id={`${idPrefix}-tank-${slot.index}`}
            cx={slot.cx}
            capacity={capacity}
            filled={slot.filled}
            metalGradientId={metalGradientId}
            liquidGradientId={liquidGradientId}
            shineGradientId={shineGradientId}
          />
        )
      })}
    </g>
  )
}
