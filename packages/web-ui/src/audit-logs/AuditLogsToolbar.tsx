import { Input } from '../ui/Input'
import { LocalizedDateTimeRangePicker } from '../ui/LocalizedDateTimeRangePicker'
import type { DateTimeRangeValue } from '../ui/LocalizedDateTimeRangePicker'
import { cn } from '../utils'

export type AuditLogsToolbarLabels = {
  searchLabel: string
  searchPlaceholder: string
  dateRangeLabel: string
  dateRangePlaceholder: string
}

type AuditLogsToolbarProps = {
  searchText: string
  onSearchTextChange: (searchText: string) => void
  value: DateTimeRangeValue
  onChange: (value: DateTimeRangeValue) => void
  labels: AuditLogsToolbarLabels
  className?: string
}

export function AuditLogsToolbar({
  searchText,
  onSearchTextChange,
  value,
  onChange,
  labels,
  className,
}: AuditLogsToolbarProps) {
  return (
    <div
      className={cn(
        'mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end',
        className,
      )}
    >
      <div className="min-w-0 w-full sm:max-w-md sm:flex-1">
        <Input
          type="search"
          label={labels.searchLabel}
          value={searchText}
          placeholder={labels.searchPlaceholder}
          className="h-11"
          onChange={(event) => onSearchTextChange(event.target.value)}
        />
      </div>
      <div className="w-full min-w-0 sm:w-72">
        <LocalizedDateTimeRangePicker
          label={labels.dateRangeLabel}
          value={value}
          onChange={onChange}
          placeholder={labels.dateRangePlaceholder}
        />
      </div>
    </div>
  )
}
