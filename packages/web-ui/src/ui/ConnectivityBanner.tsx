import { Button } from './Button'

export type ConnectivityBannerLabels = {
  offline: string
  loadFailed: string
  retry: string
}

type ConnectivityBannerProps = {
  isOnline: boolean
  isQueryError: boolean
  onRetry: () => void
  labels: ConnectivityBannerLabels
}

/**
 * Distinguishes browser offline from a failed data load.
 * Hidden when online and the query is healthy.
 */
export function ConnectivityBanner({
  isOnline,
  isQueryError,
  onRetry,
  labels,
}: ConnectivityBannerProps) {
  if (isOnline && !isQueryError) {
    return null
  }

  const message = isOnline ? labels.loadFailed : labels.offline

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-base-content/80">{message}</p>
      <Button
        type="button"
        variant="ghost"
        className="h-11 w-full border border-base-content/12 bg-base-100/50 sm:w-auto sm:px-4"
        onClick={onRetry}
      >
        {labels.retry}
      </Button>
    </div>
  )
}
