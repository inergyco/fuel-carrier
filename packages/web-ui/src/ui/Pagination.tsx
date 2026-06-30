import type { ChangeEvent } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from '../icons'
import { Button } from './Button'
import { cn } from '../utils'
import { LIMIT_OPTIONS } from '@fuel-carrier/shared-types'

export type PaginationLabels = {
  previous: () => string
  next: () => string
  showing: (params: { from: number; to: number; total: number }) => string
  pageOf: (params: { current: number; total: number }) => string
  perPage: () => string
}

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  labels: PaginationLabels
  limitOptions?: readonly number[]
  className?: string
}

export function getPaginationRange(
  page: number,
  limit: number,
  totalItems: number,
): { from: number; to: number } {
  if (totalItems === 0) {
    return { from: 0, to: 0 }
  }

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, totalItems)

  return { from, to }
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  labels,
  limitOptions = LIMIT_OPTIONS,
  className,
}: PaginationProps) {
  const { from, to } = getPaginationRange(page, limit, totalItems)
  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  function handlePrevious() {
    if (canGoPrevious) {
      onPageChange(page - 1)
    }
  }

  function handleNext() {
    if (canGoNext) {
      onPageChange(page + 1)
    }
  }

  function handleLimitChange(event: ChangeEvent<HTMLSelectElement>) {
    onLimitChange(Number(event.target.value))
  }

  if (totalItems === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-base-content/8 pt-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-xs text-base-content/50">
        {labels.showing({ from, to, total: totalItems })}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <label className="flex items-center gap-2 text-xs text-base-content/60">
          <span className="font-medium tracking-wide">{labels.perPage()}</span>
          <div dir="ltr" className="relative">
            <select
              value={limit}
              onChange={handleLimitChange}
              aria-label={labels.perPage()}
              className={cn(
                'h-8 min-h-8 w-16 appearance-none rounded-lg border pe-7 ps-2 text-center text-xs tracking-wide',
                'border-base-content/10 bg-base-200/30 text-base-content backdrop-blur-sm',
                'focus:outline-none focus:ring-1 focus:ring-primary/40',
              )}
            >
              {limitOptions.map(function renderLimitOption(option) {
                return (
                  <option key={option} value={option}>
                    {option}
                  </option>
                )
              })}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-1.5 top-1/2 size-3.5 -translate-y-1/2 text-base-content/50"
              aria-hidden
            />
          </div>
        </label>

        <p className="text-xs font-medium tracking-wide text-base-content/60">
          {labels.pageOf({ current: page, total: totalPages })}
        </p>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="icon"
            aria-label={labels.previous()}
            disabled={!canGoPrevious}
            onClick={handlePrevious}
            className="border border-base-content/8 bg-base-200/30 backdrop-blur-sm disabled:opacity-40"
          >
            <ChevronLeft
              className="size-4 rtl:rotate-180"
              aria-hidden
            />
          </Button>
          <Button
            type="button"
            variant="icon"
            aria-label={labels.next()}
            disabled={!canGoNext}
            onClick={handleNext}
            className="border border-base-content/8 bg-base-200/30 backdrop-blur-sm disabled:opacity-40"
          >
            <ChevronRight
              className="size-4 rtl:rotate-180"
              aria-hidden
            />
          </Button>
        </div>
      </div>
    </div>
  )
}
