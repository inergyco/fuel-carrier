import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { DEFAULT_LIMIT } from '@fuel-carrier/shared-types'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { AuditLogsTable } from '@fuel-carrier/web-ui/audit-logs'
import { Pagination } from '@fuel-carrier/web-ui/ui'
import { auditLogKeys, fetchAuditLogs } from '../../lib/api/audit-logs'
import { getExternalAuditLogLabels } from '../../components/audit-logs/auditLogLabels'

export const Route = createFileRoute('/_authenticated/audit-logs')({
  component: AuditLogsPage,
})

function AuditLogsPage() {
  const { LL, locale } = useI18nContext()
  const labels = getExternalAuditLogLabels(LL)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const pagination = { page, limit }
  const auditLogsQuery = useQuery({
    queryKey: auditLogKeys.all(pagination),
    queryFn: function loadAuditLogs() {
      return fetchAuditLogs(pagination)
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

        {auditLogsQuery.isLoading && !result ? (
          <p className="text-sm text-base-content/50">
            {LL.externalPanel.auditLogs.loading()}
          </p>
        ) : (result?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-base-content/50">
            {LL.externalPanel.auditLogs.empty()}
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
    </div>
  )
}
