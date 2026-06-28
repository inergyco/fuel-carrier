import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { AuditLogsTable } from '@fuel-carrier/web-ui/audit-logs'
import { auditLogKeys, fetchCompanyAuditLogs } from '../../../lib/api/audit-logs'
import { getInternalAuditLogLabels } from './auditLogLabels'

interface CompanyAuditLogsSectionProps {
  companyId: string
}

export function CompanyAuditLogsSection({
  companyId,
}: CompanyAuditLogsSectionProps) {
  const { LL, locale } = useI18nContext()
  const labels = getInternalAuditLogLabels(LL)
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
        <AuditLogsTable
          logs={auditLogsQuery.data ?? []}
          locale={locale}
          labels={labels}
        />
      )}
    </section>
  )
}
