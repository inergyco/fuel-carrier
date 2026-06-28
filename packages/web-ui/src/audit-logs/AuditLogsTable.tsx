import type { AuditLog } from '@fuel-carrier/shared-types'
import { AuditLogDetails } from './AuditLogDetails'
import {
  formatAuditAction,
  formatAuditRole,
  formatAuditTimestamp,
  type AuditLogLabels,
} from './audit-log-formatters'

interface AuditLogsTableProps {
  logs: AuditLog[]
  locale: string
  labels: AuditLogLabels
}

export function AuditLogsTable({ logs, locale, labels }: AuditLogsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-content/8">
      <table className="table table-sm w-full">
        <thead>
          <tr className="border-b border-base-content/8 text-xs tracking-widest text-base-content/40 uppercase">
            <th>{labels.when()}</th>
            <th>{labels.actor()}</th>
            <th>{labels.action()}</th>
            <th>{labels.details()}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(function renderAuditLog(log) {
            return (
              <tr
                key={log.id}
                className="border-b border-base-content/8 align-top last:border-b-0 hover:bg-base-100/30"
              >
                <td className="whitespace-nowrap text-sm text-base-content/70">
                  {formatAuditTimestamp(log, locale)}
                </td>
                <td className="min-w-40 text-sm">
                  <p className="font-medium">{log.actorDisplayName}</p>
                  <p className="font-mono text-xs text-base-content/50">
                    @{log.actorUsername}
                  </p>
                  <p className="text-xs text-base-content/40">
                    {formatAuditRole(log.actorRole, labels)}
                  </p>
                </td>
                <td className="min-w-36 text-sm font-medium">
                  {formatAuditAction(log.action, labels)}
                </td>
                <td className="max-w-xl text-sm text-base-content/70">
                  <AuditLogDetails metadata={log.metadata} labels={labels} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
