import { useQuery } from '../query'
import { cn } from '../utils'
import { FuelLevelRingChart } from './FuelLevelRingChart'
import type { CompanyDashboardDataSource } from './CompanyDashboard.types'

type FuelLevelRingSectionProps = {
  className?: string
  companyId?: string
  dataSource: CompanyDashboardDataSource
  enabled?: boolean
  /** Polling interval in ms. Defaults to 30s. Pass `false` to disable. */
  refetchInterval?: number | false
}

export function FuelLevelRingSection({
  className,
  companyId,
  dataSource,
  enabled = true,
  refetchInterval = 30_000,
}: FuelLevelRingSectionProps) {
  const statsQuery = useQuery({
    queryKey: dataSource.carsStatsKey(companyId),
    queryFn: () => dataSource.fetchFleetStats(companyId),
    enabled,
    refetchInterval: refetchInterval === false ? false : refetchInterval,
  })

  if (statsQuery.isLoading && !statsQuery.data) {
    return <FuelLevelRingSkeleton className={className} />
  }

  if (!statsQuery.data) {
    return null
  }

  return <FuelLevelRingChart stats={statsQuery.data} className={className} />
}

function FuelLevelRingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-base-content/8 bg-base-200/50 p-5 lg:h-full',
        className,
      )}
      aria-hidden
    >
      <div className="h-4 w-36 shrink-0 animate-pulse rounded bg-base-content/10" />
      <div className="mt-5 flex flex-col items-center lg:min-h-0 lg:flex-1 lg:justify-center">
        <div className="aspect-square w-full max-w-56 shrink-0 animate-pulse rounded-full border-26 border-base-content/8" />
        <div className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-2">
          {Array.from({ length: 4 }, function toSkeletonRow(_, index) {
            return (
              <div
                key={index}
                className="h-3 w-14 animate-pulse rounded bg-base-content/8"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
