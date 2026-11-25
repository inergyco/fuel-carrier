import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTableRow,
  Skeleton,
} from '../../ui'

type CarFuelMovementListSkeletonProps = {
  variant: 'table' | 'cards'
  label: string
}

const ROW_COUNT = 5

export function CarFuelMovementListSkeleton({
  variant,
  label,
}: CarFuelMovementListSkeletonProps) {
  if (variant === 'cards') {
    return (
      <ul
        className="flex flex-col gap-3"
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        {Array.from({ length: ROW_COUNT }, function renderCard(_, index) {
          return (
            <li
              key={index}
              className="rounded-2xl border border-base-content/8 bg-base-100/20 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="mt-1 h-5 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1 h-5 w-16" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="mt-1 h-5 w-16" />
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
            <DataTableHeaderCell>
              <Skeleton className="h-4 w-24" />
            </DataTableHeaderCell>
            <DataTableHeaderCell>
              <Skeleton className="h-4 w-16" />
            </DataTableHeaderCell>
            <DataTableHeaderCell>
              <Skeleton className="h-4 w-16" />
            </DataTableHeaderCell>
            <DataTableHeaderCell>
              <Skeleton className="h-4 w-24" />
            </DataTableHeaderCell>
            <DataTableHeaderCell>
              <Skeleton className="h-4 w-16" />
            </DataTableHeaderCell>
          </DataTableHeaderRow>
        </DataTableHead>
        <DataTableBody>
          {Array.from({ length: ROW_COUNT }, function renderRow(_, index) {
            return (
              <DataTableRow key={index}>
                <DataTableCell>
                  <Skeleton className="h-5 w-40" />
                </DataTableCell>
                <DataTableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </DataTableCell>
                <DataTableCell>
                  <Skeleton className="h-5 w-16" />
                </DataTableCell>
                <DataTableCell>
                  <Skeleton className="h-5 w-20" />
                </DataTableCell>
                <DataTableCell>
                  <Skeleton className="h-5 w-16" />
                </DataTableCell>
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
    </div>
  )
}
