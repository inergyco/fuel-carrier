import type { AuditLog } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { auditLogKeys, fetchCompanyAuditLogs } from '../../../lib/api/audit-logs'
import {
  formatAuditAction,
  formatAuditDetails,
  formatAuditRole,
  formatAuditTimestamp,
} from './auditLogFormatters'

interface CompanyAuditLogsSectionProps {
  companyId: string
}

export function CompanyAuditLogsSection({
  companyId,
}: CompanyAuditLogsSectionProps) {
  const { LL, locale } = useI18nContext()
  const auditLogsQuery = useQuery({
    queryKey: auditLogKeys.company(companyId),
    queryFn: function loadAuditLogs() {
      return fetchCompanyAuditLogs(companyId)
    },
  })

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {LL.internalPanel.companies.detail.auditLogsTitle()}
        </h2>
        <p className="mt-1 text-sm text-base-content/50">
          {LL.internalPanel.companies.detail.auditLogsSubtitle()}
        </p>
      </div>

      {auditLogsQuery.isLoading ? (
        <p className="text-sm text-base-content/50">
          {LL.internalPanel.companies.detail.auditLogsLoading()}
        </p>
      ) : (auditLogsQuery.data ?? []).length === 0 ? (
        <p className="text-sm text-base-content/50">
          {LL.internalPanel.companies.detail.auditLogsEmpty()}
        </p>
      ) : (
        <AuditLogsTable logs={auditLogsQuery.data ?? []} locale={locale} />
      )}
    </section>
  )
}

interface AuditLogsTableProps {
  logs: AuditLog[]
  locale: string
}

function AuditLogsTable({ logs, locale }: AuditLogsTableProps) {
  const { LL } = useI18nContext()

  return (
    <div className="overflow-x-auto rounded-xl border border-base-content/8">
      <table className="table table-sm w-full">
        <thead>
          <tr className="border-b border-base-content/8 text-xs tracking-widest text-base-content/40 uppercase">
            <th>{LL.internalPanel.companies.detail.auditLogsWhen()}</th>
            <th>{LL.internalPanel.companies.detail.auditLogsActor()}</th>
            <th>{LL.internalPanel.companies.detail.auditLogsAction()}</th>
            <th>{LL.internalPanel.companies.detail.auditLogsDetails()}</th>
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
                    {formatAuditRole(log.actorRole, LL)}
                  </p>
                </td>
                <td className="min-w-36 text-sm font-medium">
                  {formatAuditAction(log.action, LL)}
                </td>
                <td className="max-w-xl text-sm whitespace-pre-wrap text-base-content/70">
                  {formatAuditDetails(log.metadata, LL)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
