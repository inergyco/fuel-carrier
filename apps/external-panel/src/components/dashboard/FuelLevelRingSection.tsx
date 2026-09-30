import { useQuery } from '@fuel-carrier/web-ui/query'
import { cn } from '@fuel-carrier/web-ui/utils'
import { carKeys, fetchCarFleetStats } from '../../lib/api/cars'
import { FuelLevelRingChart } from './FuelLevelRingChart'

type FuelLevelRingSectionProps = {
  className?: string
  /** Polling interval in ms. Defaults to 30s. Pass `false` to disable. */
  refetchInterval?: number | false
}

export function FuelLevelRingSection({
  className,
  refetchInterval = 30_000,
}: FuelLevelRingSectionProps) {
  const statsQuery = useQuery({
    queryKey: carKeys.stats,
    queryFn: fetchCarFleetStats,
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
        'flex h-full min-h-72 flex-col rounded-2xl border border-base-content/8 bg-base-200/50 p-5',
        className,
      )}
      aria-hidden
    >
      <div className="h-4 w-36 animate-pulse rounded bg-base-content/10" />
      <div className="mx-auto mt-6 size-48 animate-pulse rounded-full border-22 border-base-content/8" />
      <div className="mt-6 space-y-2.5">
        {Array.from({ length: 4 }, function toSkeletonRow(_, index) {
          return (
            <div
              key={index}
              className="h-3.5 animate-pulse rounded bg-base-content/8"
            />
          )
        })}
      </div>
    </div>
  )
}
