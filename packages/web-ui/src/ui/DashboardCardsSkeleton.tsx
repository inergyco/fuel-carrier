import { CAR_CARD_SHELL_CLASS_NAME } from './car-card-shell'
import { Skeleton } from './Skeleton'

type DashboardCardsSkeletonProps = {
  label: string
  count?: number
  /** Tailwind grid column classes for the card list. */
  columnsClassName?: string
  /**
   * `company` matches internal company cards (logo + meta).
   * `car` matches fleet cards (watermark, plate, meta rows, fuel bar, truck + CTA).
   */
  variant?: 'company' | 'car'
  /** Mirror the pager under the card grid (dashboard cars). */
  showPagination?: boolean
  /** Skip the toolbar placeholder when the page already renders its own. */
  showToolbarSkeleton?: boolean
  /** Extra action chips in the car-card footer (cars list). */
  showCardActions?: boolean
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
  showToolbarSkeleton = true,
  showCardActions = false,
}: DashboardCardsSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {variant === 'car' && showToolbarSkeleton ? (
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <Skeleton className="h-11 w-full rounded-lg lg:max-w-sm" />
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:w-auto lg:justify-end">
            <Skeleton className="h-11 w-full rounded-lg sm:w-40" />
            <Skeleton className="h-11 w-full rounded-lg sm:w-40" />
          </div>
        </div>
      ) : null}
      {variant === 'company' ? <Skeleton className="mb-5 h-3 w-48" /> : null}

      <ul className={`grid ${columnsClassName}`}>
        {Array.from({ length: count }, function renderCard(_, index) {
          return (
            <li key={index}>
              {variant === 'car' ? (
                <CarCardSkeleton showActions={showCardActions} />
              ) : (
                <CompanyCardSkeleton />
              )}
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
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-xl">
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

function CarCardSkeleton({ showActions }: { showActions: boolean }) {
  return (
    <div className={CAR_CARD_SHELL_CLASS_NAME}>
      <Skeleton className="pointer-events-none absolute end-4 top-1/3 z-0 h-20 w-24 -translate-y-1/2 rounded-lg opacity-30" />

      <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-2.5 px-4 pt-3">
        <MetaRowSkeleton widthClassName="w-3/5" />
        <MetaRowSkeleton widthClassName="w-2/5" />
        <MetaRowSkeleton widthClassName="w-1/2" />

        <div className="mt-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>

      <div className="relative z-10 mt-auto flex items-end justify-between gap-3 px-4 pb-4 pt-3">
        <div className="relative h-16 w-20 shrink-0" />
        <div className="flex w-full min-w-0 flex-col items-end gap-4">
          {showActions ? (
            <div className="flex gap-2">
              <Skeleton className="size-11 rounded-lg" />
              <Skeleton className="size-11 rounded-lg" />
              <Skeleton className="size-11 rounded-lg" />
            </div>
          ) : null}
          <Skeleton className="h-10 w-24 shrink-0 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

function MetaRowSkeleton({ widthClassName }: { widthClassName: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Skeleton className="size-4 shrink-0 rounded" />
      <Skeleton className={`h-3.5 ${widthClassName}`} />
    </div>
  )
}
