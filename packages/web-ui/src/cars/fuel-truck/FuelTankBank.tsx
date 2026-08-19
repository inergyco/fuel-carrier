import { FuelTank } from './FuelTank'
import { getVisibleTankSlots } from './layout'

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

  return (
    <g data-tank-bank="">
      {slots.map(function renderTank(slot) {
        return (
          <FuelTank
            key={`${idPrefix}-tank-${slot.index}`}
            id={`${idPrefix}-tank-${slot.index}`}
            cx={slot.cx}
            cy={slot.cy}
            r={slot.r}
            capacity={capacity}
            filled={slot.filled}
          />
        )
      })}
    </g>
  )
}
