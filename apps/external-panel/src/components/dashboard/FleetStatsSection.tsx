import { useQuery } from '@fuel-carrier/web-ui/query'
import { cn } from '@fuel-carrier/web-ui/utils'
import { carKeys, fetchCarFleetStats } from '../../lib/api/cars'
import { FleetStatsBar } from './FleetStatsBar'

type FleetStatsSectionProps = {
  className?: string
  /** Polling interval in ms. Defaults to 30s. Pass `false` to disable. */
  refetchInterval?: number | false
}

export function FleetStatsSection({
  className,
  refetchInterval = 30_000,
}: FleetStatsSectionProps) {
  const statsQuery = useQuery({
    queryKey: carKeys.stats,
    queryFn: fetchCarFleetStats,
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
