import type { FuelGradeFilter, FuelLevelFilter } from '@fuel-carrier/shared-types'
import { Input } from './Input'
import { FuelGradeFilterControl } from './FuelGradeFilterControl'
import { FuelLevelFilterControl } from './FuelLevelFilterControl'

export type ResourceListToolbarProps = {
  searchPlaceholder: string
  searchText: string
  onSearchTextChange: (searchText: string) => void
  fuelGrade?: FuelGradeFilter
  onFuelGradeChange?: (fuelGrade: FuelGradeFilter) => void
  fuelLevel?: FuelLevelFilter
  onFuelLevelChange?: (fuelLevel: FuelLevelFilter) => void
}

export function ResourceListToolbar({
  searchPlaceholder,
  searchText,
  onSearchTextChange,
  fuelGrade = 'all',
  onFuelGradeChange,
  fuelLevel = 'all',
  onFuelLevelChange,
}: ResourceListToolbarProps) {
  const showFilters = Boolean(onFuelGradeChange || onFuelLevelChange)

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <Input
          type="search"
          value={searchText}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-11"
          onChange={(event) => onSearchTextChange(event.target.value)}
        />
      </div>

      {showFilters ? (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:w-auto lg:justify-end">
          {onFuelLevelChange ? (
            <FuelLevelFilterControl
              value={fuelLevel}
              onChange={onFuelLevelChange}
            />
          ) : null}
          {onFuelGradeChange ? (
            <FuelGradeFilterControl
              value={fuelGrade}
              onChange={onFuelGradeChange}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
