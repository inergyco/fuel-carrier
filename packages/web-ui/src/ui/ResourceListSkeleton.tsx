import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTableRow,
} from './DataTable'
import { Skeleton } from './Skeleton'
import { cn } from '../utils'

type ResourceListSkeletonProps = {
  variant: 'table' | 'cards'
  rows?: number
  columns?: number
  /** Accessible status label (e.g. localized “Loading…”). */
  label: string
  /** Card list layout classes. Stacked cards are used when this is omitted. */
  listClassName?: string
}

const DEFAULT_ROWS = 5
const DEFAULT_COLUMNS = 4

export function ResourceListSkeleton({
  variant,
  rows = DEFAULT_ROWS,
  columns = DEFAULT_COLUMNS,
  label,
  listClassName,
}: ResourceListSkeletonProps) {
  if (variant === 'cards') {
    const isGrid = Boolean(listClassName)
    const detailFieldCount = Math.max(columns, 1)

    return (
      <ul
        className={listClassName ?? 'flex flex-col gap-3'}
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        {Array.from({ length: rows }, function renderCard(_, index) {
          return (
            <li
              key={index}
              className={cn(
                'rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm',
                isGrid && 'flex h-full flex-col',
              )}
            >
              <p className="mb-3">
                <span className="inline-flex items-center gap-2.5">
                  <Skeleton className="size-12 shrink-0 rounded-lg" />
                  <Skeleton className="h-5 w-28" />
                </span>
              </p>
              <dl
                className={cn(
                  'grid gap-2',
                  isGrid && 'min-h-0 flex-1 content-start',
                )}
              >
                {Array.from(
                  { length: detailFieldCount },
                  function renderField(_, fieldIndex) {
                    return (
                      <div key={fieldIndex}>
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="mt-1 h-5 w-2/5" />
                      </div>
                    )
                  },
                )}
              </dl>
              <div className="mt-4 border-t border-base-content/8 pt-4">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Skeleton className="size-11 shrink-0 rounded-lg" />
                  <Skeleton className="size-11 shrink-0 rounded-lg" />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <DataTable>
        <DataTableHead>
          <DataTableHeaderRow>
            {Array.from({ length: columns }, function renderHeader(_, index) {
              return (
                <DataTableHeaderCell key={index}>
                  <Skeleton className="h-3 w-16" />
                </DataTableHeaderCell>
              )
            })}
          </DataTableHeaderRow>
        </DataTableHead>
        <DataTableBody>
          {Array.from({ length: rows }, function renderRow(_, rowIndex) {
            return (
              <DataTableRow key={rowIndex}>
                {Array.from(
                  { length: columns },
                  function renderCell(_, cellIndex) {
                    return (
                      <DataTableCell key={cellIndex}>
                        <Skeleton
                          className={cellIndex === 0 ? 'h-4 w-28' : 'h-4 w-20'}
                        />
                      </DataTableCell>
                    )
                  },
                )}
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
    </div>
  )
}
