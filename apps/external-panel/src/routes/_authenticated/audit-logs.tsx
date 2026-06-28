import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { AuditLogsTable } from '@fuel-carrier/web-ui/audit-logs'
import { auditLogKeys, fetchAuditLogs } from '../../lib/api/audit-logs'
import { getExternalAuditLogLabels } from '../../components/audit-logs/auditLogLabels'

export const Route = createFileRoute('/_authenticated/audit-logs')({
  component: AuditLogsPage,
})

function AuditLogsPage() {
  const { LL, locale } = useI18nContext()
  const labels = getExternalAuditLogLabels(LL)
  const auditLogsQuery = useQuery({
    queryKey: auditLogKeys.all,
    queryFn: fetchAuditLogs,
  })

  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-6">
        <div className="mb-4">
          <h1 className="text-lg font-semibold tracking-tight">
            {LL.externalPanel.auditLogs.title()}
          </h1>
          <p className="mt-1 text-sm text-base-content/50">
            {LL.externalPanel.auditLogs.subtitle()}
          </p>
        </div>

        {auditLogsQuery.isLoading ? (
          <p className="text-sm text-base-content/50">
            {LL.externalPanel.auditLogs.loading()}
          </p>
        ) : (auditLogsQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-base-content/50">
            {LL.externalPanel.auditLogs.empty()}
          </p>
        ) : (
          <AuditLogsTable
            logs={auditLogsQuery.data ?? []}
            locale={locale}
            labels={labels}
          />
        )}
      </section>
    </div>
  )
}
