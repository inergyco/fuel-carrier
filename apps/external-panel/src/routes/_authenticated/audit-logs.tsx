import { createFileRoute, redirect } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { AuditLogsTable } from '@fuel-carrier/web-ui/audit-logs'
import {
  MEDIA_QUERIES,
  Pagination,
  QueryErrorState,
  ResourceListSkeleton,
  parsePaginationSearch,
  useMediaQuery,
  usePagination,
} from '@fuel-carrier/web-ui/ui'
import { auditLogKeys, fetchAuditLogs } from '../../lib/api/audit-logs'
import { getExternalAuditLogLabels } from '../../components/audit-logs/auditLogLabels'

export const Route = createFileRoute('/_authenticated/audit-logs')({
  validateSearch: parsePaginationSearch,
  beforeLoad: function requireCompanyAdmin({ context }) {
    if (!isCompanyUserAdmin(context.user)) {
      throw redirect({ to: '/' })
    }
  },
  component: AuditLogsPage,
})

function AuditLogsPage() {
  const { LL, locale } = useI18nContext()
  const labels = getExternalAuditLogLabels(LL)
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)
  const { pagination, handlePageChange, handleLimitChange } = usePagination()
  const auditLogsQuery = useQuery({
    queryKey: auditLogKeys.all(pagination),
    queryFn: function loadAuditLogs() {
      return fetchAuditLogs(pagination)
    },
    placeholderData: (previousData) => previousData,
  })
  const result = auditLogsQuery.data

  function renderBody() {
    if (auditLogsQuery.isLoading && !result) {
      return (
        <ResourceListSkeleton
          variant={isMdUp ? 'table' : 'cards'}
          columns={4}
          label={LL.externalPanel.auditLogs.loading()}
        />
      )
    }

    if (auditLogsQuery.isError) {
      return (
        <QueryErrorState
          onRetry={() => {
            void auditLogsQuery.refetch()
          }}
          labels={{
            loadFailed: LL.common.queryError.loadFailed(),
            retry: LL.common.queryError.retry(),
          }}
        />
      )
    }

    if ((result?.items.length ?? 0) === 0) {
      return (
        <p className="text-sm text-base-content/50">
          {LL.externalPanel.auditLogs.empty()}
        </p>
      )
    }

    return (
      <div
        className={
          auditLogsQuery.isFetching
            ? 'opacity-60 transition-opacity'
            : undefined
        }
      >
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
    )
  }

  return (
    <div>
      <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-sm md:p-6">
        <div className="mb-4">
          <h1 className="text-lg font-semibold tracking-tight">
            {LL.externalPanel.auditLogs.title()}
          </h1>
          <p className="mt-1 text-sm text-base-content/50">
            {LL.externalPanel.auditLogs.subtitle()}
          </p>
        </div>

        {renderBody()}
      </section>
    </div>
  )
}
