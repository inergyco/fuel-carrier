import { useState } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { DEFAULT_LIMIT } from '@fuel-carrier/shared-types'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { AuditLogsTable } from '@fuel-carrier/web-ui/audit-logs'
import { Pagination } from '@fuel-carrier/web-ui/ui'
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
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const pagination = { page, limit }
  const auditLogsQuery = useQuery({
    queryKey: auditLogKeys.company(companyId, pagination),
    queryFn: function loadAuditLogs() {
      return fetchCompanyAuditLogs(companyId, pagination)
    },
    placeholderData: (previousData) => previousData,
  })
  const result = auditLogsQuery.data

  function handlePageChange(nextPage: number) {
    setPage(nextPage)
  }

  function handleLimitChange(nextLimit: number) {
    setLimit(nextLimit)
    setPage(1)
  }

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

      {auditLogsQuery.isLoading && !result ? (
        <p className="text-sm text-base-content/50">
          {LL.internalPanel.companies.detail.auditLogsLoading()}
        </p>
      ) : (result?.items.length ?? 0) === 0 ? (
        <p className="text-sm text-base-content/50">
          {LL.internalPanel.companies.detail.auditLogsEmpty()}
        </p>
      ) : (
        <div className={auditLogsQuery.isFetching ? 'opacity-60 transition-opacity' : undefined}>
          <AuditLogsTable
            logs={result?.items ?? []}
            locale={locale}
            labels={labels}
          />
          {result ? (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              totalItems={result.totalItems}
              limit={result.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              labels={LL.common.pagination}
            />
          ) : null}
        </div>
      )}
    </section>
  )
}
