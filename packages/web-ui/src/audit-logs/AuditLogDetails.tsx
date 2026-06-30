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
  const contextLines = _buildContextLines(metadata, labels)
  const hasChanges =
    metadata.changes != null && Object.keys(metadata.changes).length > 0
  const hasSnapshot =
    metadata.snapshot != null && Object.keys(metadata.snapshot).length > 0

  if (
    contextLines.length > 0 ||
    hasChanges ||
    hasSnapshot ||
    metadata.username
  ) {
    return (
      <div className="space-y-2">
        {contextLines.map(function renderContextLine(line) {
          return (
            <AuditLogValueLine
              key={line.field}
              label={line.label}
              value={line.value}
              valueDir={line.valueDir}
            />
          )
        })}
        {hasChanges
          ? Object.entries(metadata.changes!).map(function renderChange([
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
            })
          : null}
        {hasSnapshot ? (
          <div className="space-y-1">
            <p>{labels.deletedSnapshot()}</p>
            {Object.entries(metadata.snapshot!).map(function renderSnapshot([
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
        ) : null}
        {metadata.username && !hasChanges && !hasSnapshot ? (
          <AuditLogValueLine
            label={formatAuditFieldLabel('username', labels)}
            value={metadata.username}
            valueDir="ltr"
          />
        ) : null}
      </div>
    )
  }

  return <span>{labels.noDetails()}</span>
}

function _buildContextLines(
  metadata: AuditLogMetadata,
  labels: AuditLogLabels,
): Array<{ field: string; label: string; value: string; valueDir?: 'ltr' | 'auto' }> {
  const lines: Array<{
    field: string
    label: string
    value: string
    valueDir?: 'ltr' | 'auto'
  }> = []

  if (metadata.companyName) {
    lines.push({
      field: 'company',
      label: formatAuditFieldLabel('company', labels),
      value: metadata.companyName,
    })
  }

  if (metadata.entityLabel) {
    lines.push({
      field: 'subject',
      label: formatAuditFieldLabel('subject', labels),
      value: metadata.entityLabel,
      valueDir: 'auto',
    })
  }

  return lines
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
