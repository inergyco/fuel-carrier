import { useQuery } from '../query'
import { cn } from '../utils'
import { FleetStatsBar } from './FleetStatsBar'
import type { CompanyDashboardDataSource } from './CompanyDashboard.types'

type FleetStatsSectionProps = {
  className?: string
  companyId?: string
  dataSource: CompanyDashboardDataSource
  enabled?: boolean
  /** Polling interval in ms. Defaults to 30s. Pass `false` to disable. */
  refetchInterval?: number | false
}

export function FleetStatsSection({
  className,
  companyId,
  dataSource,
  enabled = true,
  refetchInterval = 30_000,
}: FleetStatsSectionProps) {
  const statsQuery = useQuery({
    queryKey: dataSource.carsStatsKey(companyId),
    queryFn: () => dataSource.fetchFleetStats(companyId),
    enabled,
    refetchInterval: refetchInterval === false ? false : refetchInterval,
  })

  if (statsQuery.isLoading && !statsQuery.data) {
    return <FleetStatsSkeleton className={className} />
  }

  if (!statsQuery.data) {
    return null
  }

  return <FleetStatsBar stats={statsQuery.data} className={className} />
}

function FleetStatsSkeleton({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        'grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6',
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: 6 }, function toSkeletonItem(_, index) {
        return (
          <li key={index}>
            <div className="h-[4.5rem] animate-pulse rounded-2xl border border-base-content/8 bg-base-200/50" />
          </li>
        )
      })}
    </ul>
  )
}
