import type { AuditLogMetadata } from '@fuel-carrier/shared-types'
import { ArrowRight } from '../icons'
import { iconSmClassName, ICON_STROKE_WIDTH } from '../ui/iconClassName'
import { cn } from '../utils'
import {
  formatAuditFieldLabel,
  formatAuditValue,
  type AuditLogLabels,
} from './audit-log-formatters'

interface AuditLogDetailsProps {
  metadata: AuditLogMetadata
  labels: AuditLogLabels
}

export function AuditLogDetails({ metadata, labels }: AuditLogDetailsProps) {
  if (metadata.changes && Object.keys(metadata.changes).length > 0) {
    return (
      <div className="space-y-2">
        {Object.entries(metadata.changes).map(function renderChange([
          field,
          change,
        ]) {
          return (
            <AuditLogChangeLine
              key={field}
              label={formatAuditFieldLabel(field, labels)}
              from={formatAuditValue(change.from)}
              to={formatAuditValue(change.to)}
            />
          )
        })}
      </div>
    )
  }

  if (metadata.snapshot && Object.keys(metadata.snapshot).length > 0) {
    return (
      <div className="space-y-1">
        <p>{labels.deletedSnapshot()}</p>
        {Object.entries(metadata.snapshot).map(function renderSnapshot([
          field,
          value,
        ]) {
          return (
            <AuditLogValueLine
              key={field}
              label={formatAuditFieldLabel(field, labels)}
              value={formatAuditValue(value)}
            />
          )
        })}
      </div>
    )
  }

  if (metadata.username) {
    return (
      <AuditLogValueLine
        label={formatAuditFieldLabel('username', labels)}
        value={metadata.username}
        valueDir="ltr"
      />
    )
  }

  return <span>{labels.noDetails()}</span>
}

interface AuditLogChangeLineProps {
  label: string
  from: string
  to: string
}

function AuditLogChangeLine({ label, from, to }: AuditLogChangeLineProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-base-content/50">{label}</p>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <bdi dir="auto">{from}</bdi>
        <ArrowRight
          className={cn(iconSmClassName, 'text-base-content/55 rtl:rotate-180')}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
        <bdi dir="auto">{to}</bdi>
      </div>
    </div>
  )
}

interface AuditLogValueLineProps {
  label: string
  value: string
  valueDir?: 'ltr' | 'auto'
}

function AuditLogValueLine({
  label,
  value,
  valueDir = 'auto',
}: AuditLogValueLineProps) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-1">
      <span className="shrink-0">{label}:</span>
      <bdi dir={valueDir} className="inline-block">
        {value}
      </bdi>
    </p>
  )
}
