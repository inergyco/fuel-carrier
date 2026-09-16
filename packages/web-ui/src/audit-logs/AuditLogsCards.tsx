import type { AuditLog } from '@fuel-carrier/shared-types'
import { AuditLogDetails } from './AuditLogDetails'
import {
  formatAuditAction,
  formatAuditTimestamp,
  type AuditLogLabels,
} from './audit-log-formatters'

type AuditLogsCardsProps = {
  logs: AuditLog[]
  locale: string
  labels: AuditLogLabels
}

export function AuditLogsCards({ logs, locale, labels }: AuditLogsCardsProps) {
  return (
    <ul className="flex flex-col gap-3">
      {logs.map(function renderAuditLogCard(log) {
        return (
          <li
            key={log.id}
            className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm"
          >
            <p className="text-xs text-base-content/45">
              {formatAuditTimestamp(log, locale)}
            </p>
            <p className="mt-1 text-base font-medium tracking-tight">
              {formatAuditAction(log.action, labels)}
            </p>
            <dl className="mt-3 grid gap-2 text-sm text-base-content/70">
              <div>
                <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                  {labels.actor()}
                </dt>
                <dd className="mt-1 font-medium text-base-content">
                  {log.actorDisplayName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
                  {labels.details()}
                </dt>
                <dd className="mt-1 wrap-break-word whitespace-pre-wrap">
                  <AuditLogDetails metadata={log.metadata} labels={labels} />
                </dd>
              </div>
            </dl>
          </li>
        )
      })}
    </ul>
  )
}
