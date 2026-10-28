import type { ReactNode } from 'react'

type MetricColumnProps = {
  children: ReactNode
}

export function MetricColumn({ children }: MetricColumnProps) {
  return <dl className="grid grid-cols-3 gap-2 lg:grid-cols-1">{children}</dl>
}

type MetricCellProps = {
  label: ReactNode
  value: ReactNode
}

export function MetricCell({ label, value }: MetricCellProps) {
  return (
    <div className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-base-content/8 bg-base-100/30 px-2 py-2 text-center lg:min-h-[4.5rem] lg:px-3">
      <dt className="text-xs font-medium leading-snug text-base-content/65 sm:text-sm">
        {label}
      </dt>
      <dd className="text-sm font-semibold tabular-nums text-base-content sm:text-base">
        {value}
      </dd>
    </div>
  )
}
