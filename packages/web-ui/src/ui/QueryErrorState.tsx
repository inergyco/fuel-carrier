import { Button } from './Button'

export type QueryErrorStateLabels = {
  loadFailed: string
  retry: string
}

type QueryErrorStateProps = {
  onRetry: () => void
  labels: QueryErrorStateLabels
}

/**
 * Explicit error + retry for list/detail queries.
 * Use instead of treating failed fetches as empty or not-found.
 */
export function QueryErrorState({ onRetry, labels }: QueryErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-error/25 bg-error/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-base-content/80">{labels.loadFailed}</p>
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
