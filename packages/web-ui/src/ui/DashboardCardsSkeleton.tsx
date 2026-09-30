import { Skeleton } from './Skeleton'

type DashboardCardsSkeletonProps = {
  label: string
  count?: number
  /** Tailwind grid column classes for the card list. */
  columnsClassName?: string
  /**
   * `company` matches internal company cards (logo + meta).
   * `car` matches external fleet cards (plate, rows, fuel bar, truck + CTA).
   */
  variant?: 'company' | 'car'
  /** Mirror the pager under the card grid (dashboard cars). */
  showPagination?: boolean
}

const DEFAULT_COUNT = 6

/**
 * Loading placeholders matching dashboard fleet/company card grids.
 */
export function DashboardCardsSkeleton({
  label,
  count = DEFAULT_COUNT,
  columnsClassName = 'grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3',
  variant = 'company',
  showPagination = false,
}: DashboardCardsSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {variant === 'car' ? (
        <>
          <div className="mb-4 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <Skeleton className="h-11 w-full rounded-lg lg:max-w-sm" />
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:w-auto lg:justify-end">
              <Skeleton className="h-11 w-full rounded-lg sm:w-40" />
              <Skeleton className="h-11 w-full rounded-lg sm:w-40" />
            </div>
          </div>
        </>
      ) : (
        <Skeleton className="mb-5 h-3 w-48" />
      )}

      <ul className={`grid ${columnsClassName}`}>
        {Array.from({ length: count }, function renderCard(_, index) {
          return (
            <li key={index}>
              {variant === 'car' ? <CarCardSkeleton /> : <CompanyCardSkeleton />}
            </li>
          )
        })}
      </ul>

      {showPagination ? <PaginationSkeleton /> : null}
    </div>
  )
}

function PaginationSkeleton() {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-base-content/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-3 w-44" />
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Skeleton className="h-3 w-24" />
        <div className="flex items-center gap-1">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

function CompanyCardSkeleton() {
  return (
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
  )
}

function CarCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-primary/15 bg-base-100 shadow-[0_8px_28px_-18px] shadow-base-content/25">
      <div className="space-y-2 px-4 pt-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pt-3">
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-1/2" />

        <div className="mt-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 px-4 pb-4 pt-3">
        <Skeleton className="h-16 w-28 shrink-0 rounded-lg" />
        <Skeleton className="h-10 w-24 shrink-0 rounded-lg" />
      </div>
    </div>
  )
}
