import { Skeleton } from './Skeleton'

type DashboardCardsSkeletonProps = {
  label: string
  count?: number
  /** Tailwind grid column classes for the card list. */
  columnsClassName?: string
}

const DEFAULT_COUNT = 6

/**
 * Loading placeholders matching dashboard fleet/company card grids.
 */
export function DashboardCardsSkeleton({
  label,
  count = DEFAULT_COUNT,
  columnsClassName = 'grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3',
}: DashboardCardsSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <Skeleton className="mb-5 h-3 w-48" />
      <ul className={`grid ${columnsClassName}`}>
        {Array.from({ length: count }, function renderCard(_, index) {
          return (
            <li key={index}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
