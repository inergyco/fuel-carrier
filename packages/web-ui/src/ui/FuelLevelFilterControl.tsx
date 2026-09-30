import type { ChangeEvent } from 'react'
import type { FuelLevelFilter } from '@fuel-carrier/shared-types'
import { FUEL_LEVEL_FILTERS } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { cn } from '../utils'
import { Select } from './Select'

export type FuelLevelFilterControlProps = {
  value: FuelLevelFilter
  onChange: (fuelLevel: FuelLevelFilter) => void
  className?: string
}

export function FuelLevelFilterControl({
  value,
  onChange,
  className,
}: FuelLevelFilterControlProps) {
  const { LL } = useI18nContext()
  const filterLabel = LL.common.listFilters.fuelLevelFilterLabel()

  function fuelLevelLabel(option: FuelLevelFilter): string {
    if (option === 'high') {
      return LL.common.fleetStats.fuelHigh()
    }

    if (option === 'midHigh') {
      return LL.common.fleetStats.fuelMidHigh()
    }

    if (option === 'midLow') {
      return LL.common.fleetStats.fuelMidLow()
    }

    if (option === 'low') {
      return LL.common.fleetStats.fuelLow()
    }

    return LL.common.listFilters.fuelLevelAll()
  }

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value as FuelLevelFilter)
  }

  return (
    <Select
      aria-label={filterLabel}
      value={value}
      onChange={handleChange}
      className={cn(
        'w-full min-w-0 border-base-content/12 sm:w-56',
        className,
      )}
    >
      {FUEL_LEVEL_FILTERS.map(function renderFuelLevelOption(option) {
        return (
          <option key={option} value={option}>
            {fuelLevelLabel(option)}
          </option>
        )
      })}
    </Select>
  )
}
