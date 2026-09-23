import type { AssignmentFilter } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { cn } from '../utils'
import { Button } from './Button'
import { Input } from './Input'

export type ResourceListToolbarProps = {
  searchPlaceholder: string
  searchText: string
  onSearchTextChange: (searchText: string) => void
  assignment?: AssignmentFilter
  onAssignmentChange?: (assignment: AssignmentFilter) => void
  showAssignmentFilter?: boolean
}

const ASSIGNMENT_OPTIONS: AssignmentFilter[] = [
  'all',
  'assigned',
  'unassigned',
]

export function ResourceListToolbar({
  searchPlaceholder,
  searchText,
  onSearchTextChange,
  assignment = 'all',
  onAssignmentChange,
  showAssignmentFilter = true,
}: ResourceListToolbarProps) {
  const { LL } = useI18nContext()

  function assignmentLabel(option: AssignmentFilter): string {
    if (option === 'assigned') {
      return LL.common.listFilters.assignmentAssigned()
    }

    if (option === 'unassigned') {
      return LL.common.listFilters.assignmentUnassigned()
    }

    return LL.common.listFilters.assignmentAll()
  }

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

      {showAssignmentFilter && onAssignmentChange ? (
        <div
          role="group"
          aria-label={LL.common.listFilters.assignmentFilterLabel()}
          className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap"
        >
          {ASSIGNMENT_OPTIONS.map((option) => {
            const isActive = assignment === option

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
                onClick={() => onAssignmentChange(option)}
              >
                {assignmentLabel(option)}
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
