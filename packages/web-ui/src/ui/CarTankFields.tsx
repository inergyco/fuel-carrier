import {
  MAX_TANK_CAPACITY_LITERS,
  MAX_TANK_COUNT,
  MIN_TANK_CAPACITY_LITERS,
  MIN_TANK_COUNT,
} from '@fuel-carrier/shared-types'

import { FormInput } from './FormInput'
import { FormSelect } from './FormSelect'

const TANK_COUNT_OPTIONS = Array.from(
  { length: MAX_TANK_COUNT - MIN_TANK_COUNT + 1 },
  (_, index) => MIN_TANK_COUNT + index,
)

type CarTankFieldsProps = {
  tankCountLabel: string
  tankCapacityLabel: string
  tankCapacityHint: string
}

export function CarTankFields({
  tankCountLabel,
  tankCapacityLabel,
  tankCapacityHint,
}: CarTankFieldsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelect name="tankCount" label={tankCountLabel}>
          {TANK_COUNT_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </FormSelect>
        <FormInput
          name="tankCapacityLiters"
          label={tankCapacityLabel}
          type="number"
          inputMode="numeric"
          digitsOnly
          min={MIN_TANK_CAPACITY_LITERS}
          max={MAX_TANK_CAPACITY_LITERS}
          step={1}
        />
      </div>
      <p className="text-xs text-base-content/45">{tankCapacityHint}</p>
    </div>
  )
}
