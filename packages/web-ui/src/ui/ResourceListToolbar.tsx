import type { FuelGradeFilter } from '@fuel-carrier/shared-types'
import { Input } from './Input'
import { FuelGradeFilterControl } from './FuelGradeFilterControl'

export type ResourceListToolbarProps = {
  searchPlaceholder: string
  searchText: string
  onSearchTextChange: (searchText: string) => void
  fuelGrade?: FuelGradeFilter
  onFuelGradeChange?: (fuelGrade: FuelGradeFilter) => void
}

export function ResourceListToolbar({
  searchPlaceholder,
  searchText,
  onSearchTextChange,
  fuelGrade = 'all',
  onFuelGradeChange,
}: ResourceListToolbarProps) {
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

      {onFuelGradeChange ? (
        <FuelGradeFilterControl
          value={fuelGrade}
          onChange={onFuelGradeChange}
        />
      ) : null}
    </div>
  )
}
