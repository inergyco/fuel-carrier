import { FuelTank } from './FuelTank'
import { getVisibleTankSlots, MANIFOLD_Y } from './layout'

export type FuelTankBankProps = {
  capacity: number
  filled: number[]
  idPrefix: string
}

export function FuelTankBank({ capacity, filled, idPrefix }: FuelTankBankProps) {
  const slots = getVisibleTankSlots(filled)

  if (slots.length === 0) {
    return null
  }

  const manifoldStart = slots[0]!.cx - 12
  const manifoldEnd = slots[slots.length - 1]!.cx + 12

  return (
    <g data-tank-bank="">
      <rect
        x={manifoldStart}
        y={MANIFOLD_Y}
        width={manifoldEnd - manifoldStart}
        height={8}
        rx={4}
        fill="#475569"
        stroke="#334155"
        strokeWidth={1.5}
      />
      <rect
        x={manifoldStart + 3}
        y={MANIFOLD_Y + 2}
        width={manifoldEnd - manifoldStart - 6}
        height={2}
        rx={1}
        fill="#94a3b8"
      />

      {slots.map(function renderTank(slot) {
        return (
          <FuelTank
            key={`${idPrefix}-tank-${slot.index}`}
            id={`${idPrefix}-tank-${slot.index}`}
            cx={slot.cx}
            capacity={capacity}
            filled={slot.filled}
          />
        )
      })}
    </g>
  )
}
