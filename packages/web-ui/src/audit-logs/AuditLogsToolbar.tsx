import { LocalizedDateTimeRangePicker } from '../ui/LocalizedDateTimeRangePicker'
import type { DateTimeRangeValue } from '../ui/LocalizedDateTimeRangePicker'
import { cn } from '../utils'

export type AuditLogsToolbarLabels = {
  dateRangeLabel: string
  dateRangePlaceholder: string
}

type AuditLogsToolbarProps = {
  value: DateTimeRangeValue
  onChange: (value: DateTimeRangeValue) => void
  labels: AuditLogsToolbarLabels
  className?: string
}

export function AuditLogsToolbar({
  value,
  onChange,
  labels,
  className,
}: AuditLogsToolbarProps) {
  return (
    <div className={cn('mb-4 w-full min-w-0 sm:max-w-2xs', className)}>
      <LocalizedDateTimeRangePicker
        label={labels.dateRangeLabel}
        value={value}
        onChange={onChange}
        placeholder={labels.dateRangePlaceholder}
      />
    </div>
  )
}
