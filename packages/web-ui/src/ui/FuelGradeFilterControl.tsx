import type { FuelGradeFilter } from '@fuel-carrier/shared-types'
import { FUEL_GRADE_FILTERS } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { cn } from '../utils'
import { Button } from './Button'

export type FuelGradeFilterProps = {
  value: FuelGradeFilter
  onChange: (fuelGrade: FuelGradeFilter) => void
  className?: string
}

export function FuelGradeFilterControl({
  value,
  onChange,
  className,
}: FuelGradeFilterProps) {
  const { LL } = useI18nContext()

  function fuelGradeLabel(option: FuelGradeFilter): string {
    if (option === 'highGrade') {
      return LL.common.listFilters.fuelGradeHighGrade()
    }

    if (option === 'normal') {
      return LL.common.listFilters.fuelGradeNormal()
    }

    return LL.common.listFilters.fuelGradeAll()
  }

  return (
    <div
      role="group"
      aria-label={LL.common.listFilters.fuelGradeFilterLabel()}
      className={cn(
        'grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap',
        className,
      )}
    >
      {FUEL_GRADE_FILTERS.map(function renderFuelGradeOption(option) {
        const isActive = value === option

        return (
          <Button
            key={option}
            type="button"
            variant={isActive ? 'primary' : 'ghost'}
            className={cn(
              'h-11 min-h-11 w-full px-3 normal-case tracking-normal sm:w-auto sm:px-4',
              !isActive &&
                'border border-base-content/12 bg-base-100/45 text-base-content/70',
            )}
            aria-pressed={isActive}
            onClick={function handleFuelGradeClick() {
              onChange(option)
            }}
          >
            {fuelGradeLabel(option)}
          </Button>
        )
      })}
    </div>
  )
}
