import type { AuditLog } from '@fuel-carrier/shared-types'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTableRow,
} from '../ui/DataTable'
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
    <DataTable>
      <DataTableHead>
        <DataTableHeaderRow>
          <DataTableHeaderCell>{labels.when()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.actor()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.action()}</DataTableHeaderCell>
          <DataTableHeaderCell>{labels.details()}</DataTableHeaderCell>
        </DataTableHeaderRow>
      </DataTableHead>
      <DataTableBody>
        {logs.map(function renderAuditLog(log) {
          return (
            <DataTableRow key={log.id}>
              <DataTableCell className="whitespace-nowrap align-top">
                {formatAuditTimestamp(log, locale)}
              </DataTableCell>
              <DataTableCell className="min-w-40 align-top">
                <p className="font-medium">{log.actorDisplayName}</p>
                <p className="font-mono text-xs text-base-content/55">
                  @{log.actorUsername}
                </p>
                <p className="text-xs text-base-content/50">
                  {formatAuditRole(log.actorRole, labels)}
                </p>
              </DataTableCell>
              <DataTableCell className="min-w-36 align-top font-medium">
                {formatAuditAction(log.action, labels)}
              </DataTableCell>
              <DataTableCell className="max-w-xl align-top">
                <AuditLogDetails metadata={log.metadata} labels={labels} />
              </DataTableCell>
            </DataTableRow>
          )
        })}
      </DataTableBody>
    </DataTable>
  )
}
