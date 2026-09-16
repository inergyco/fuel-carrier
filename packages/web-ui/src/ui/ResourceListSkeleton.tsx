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

type ResourceListSkeletonProps = {
  variant: 'table' | 'cards'
  rows?: number
  columns?: number
  /** Accessible status label (e.g. localized “Loading…”). */
  label: string
}

const DEFAULT_ROWS = 5
const DEFAULT_COLUMNS = 4

export function ResourceListSkeleton({
  variant,
  rows = DEFAULT_ROWS,
  columns = DEFAULT_COLUMNS,
  label,
}: ResourceListSkeletonProps) {
  if (variant === 'cards') {
    return (
      <ul
        className="flex flex-col gap-3"
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        {Array.from({ length: rows }, function renderCard(_, index) {
          return (
            <li
              key={index}
              className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm"
            >
              <Skeleton className="mb-3 h-5 w-2/5" />
              <div className="grid gap-2">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-1/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
              <div className="mt-4 flex gap-3 border-t border-base-content/8 pt-4">
                <Skeleton className="size-11 shrink-0 rounded-lg" />
                <Skeleton className="size-11 shrink-0 rounded-lg" />
                <Skeleton className="size-11 shrink-0 rounded-lg" />
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
                          className={
                            cellIndex === 0 ? 'h-4 w-28' : 'h-4 w-20'
                          }
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
