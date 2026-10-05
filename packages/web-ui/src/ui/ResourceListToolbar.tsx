import type { FuelGradeFilter, FuelLevelFilter } from '@fuel-carrier/shared-types'
import { cn } from '../utils'
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
  className?: string
}

export function ResourceListToolbar({
  searchPlaceholder,
  searchText,
  onSearchTextChange,
  fuelGrade = 'all',
  onFuelGradeChange,
  fuelLevel = 'all',
  onFuelLevelChange,
  className,
}: ResourceListToolbarProps) {
  const showFilters = Boolean(onFuelGradeChange || onFuelLevelChange)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      <div className="min-w-0 flex-1 sm:min-w-64 sm:max-w-md">
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
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
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
