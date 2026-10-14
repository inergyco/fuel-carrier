import { createFileRoute } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
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
import { getInternalAuditLogLabels } from '../../components/audit-logs/auditLogLabels'

export const Route = createFileRoute('/_authenticated/audit-logs')({
  validateSearch: parseAuditLogSearch,
  component: AuditLogsPage,
})

function AuditLogsPage() {
  const { LL, locale } = useI18nContext()
  const labels = getInternalAuditLogLabels(LL)
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)
  const {
    listParams,
    draftSearchText,
    setDraftSearchText,
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

  return (
    <div>
      <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm md:p-6">
        <AuditLogsToolbar
          searchText={draftSearchText}
          onSearchTextChange={setDraftSearchText}
          value={draftRange}
          onChange={handleRangeChange}
          labels={{
            searchLabel: LL.common.search.label(),
            searchPlaceholder: LL.internalPanel.auditLogs.searchPlaceholder(),
            dateRangeLabel: LL.common.dateRange.label(),
            dateRangePlaceholder: LL.common.dateRange.placeholder(),
          }}
        />
        {auditLogsQuery.isLoading && !result ? (
          <ResourceListSkeleton
            variant={isMdUp ? 'table' : 'cards'}
            columns={4}
            label={LL.internalPanel.auditLogs.loading()}
          />
        ) : auditLogsQuery.isError ? (
          <QueryErrorState
            onRetry={() => {
              void auditLogsQuery.refetch()
            }}
            labels={{
              loadFailed: LL.common.queryError.loadFailed(),
              retry: LL.common.queryError.retry(),
            }}
          />
        ) : (result?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-base-content/50">
            {hasActiveFilters
              ? LL.internalPanel.auditLogs.emptyFiltered()
              : LL.internalPanel.auditLogs.empty()}
          </p>
        ) : (
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
        )}
      </section>
    </div>
  )
}
