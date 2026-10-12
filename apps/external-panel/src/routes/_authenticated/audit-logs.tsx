import { createFileRoute, redirect } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isCompanyUserAdmin } from '@fuel-carrier/shared-types'
import { useQuery } from '@fuel-carrier/web-ui/query'
import {
  AuditLogsTable,
  AuditLogsToolbar,
  parseAuditLogSearch,
  useAuditLogSearch,
} from '@fuel-carrier/web-ui/audit-logs'
import {
  MEDIA_QUERIES,
  Pagination,
  QueryErrorState,
  ResourceListSkeleton,
  useMediaQuery,
} from '@fuel-carrier/web-ui/ui'
import { auditLogKeys, fetchAuditLogs } from '../../lib/api/audit-logs'
import { getExternalAuditLogLabels } from '../../components/audit-logs/auditLogLabels'

export const Route = createFileRoute('/_authenticated/audit-logs')({
  validateSearch: parseAuditLogSearch,
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
  const {
    listParams,
    draftRange,
    handleRangeChange,
    handlePageChange,
    handleLimitChange,
    hasActiveFilters,
  } = useAuditLogSearch()
  const auditLogsQuery = useQuery({
    queryKey: auditLogKeys.all(listParams),
    queryFn: function loadAuditLogs() {
      return fetchAuditLogs(listParams)
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
          {hasActiveFilters
            ? LL.externalPanel.auditLogs.emptyFiltered()
            : LL.externalPanel.auditLogs.empty()}
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
      <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm md:p-6">
        <AuditLogsToolbar
          value={draftRange}
          onChange={handleRangeChange}
          labels={{
            dateRangeLabel: LL.common.dateRange.label(),
            dateRangePlaceholder: LL.common.dateRange.placeholder(),
          }}
        />
        {renderBody()}
      </section>
    </div>
  )
}
