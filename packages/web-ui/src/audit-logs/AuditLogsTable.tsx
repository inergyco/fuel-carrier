import type { AuditLog } from '@fuel-carrier/shared-types'
import { MEDIA_QUERIES, useMediaQuery } from '../ui'
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
import { AuditLogsCards } from './AuditLogsCards'
import {
  formatAuditAction,
  formatAuditTimestamp,
  type AuditLogLabels,
} from './audit-log-formatters'

type AuditLogsTableProps = {
  logs: AuditLog[]
  locale: string
  labels: AuditLogLabels
}

export function AuditLogsTable({ logs, locale, labels }: AuditLogsTableProps) {
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)

  if (!isMdUp) {
    return <AuditLogsCards logs={logs} locale={locale} labels={labels} />
  }

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
