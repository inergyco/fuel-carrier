import { useI18nContext } from '@fuel-carrier/i18n/react'
import { useQuery } from '@fuel-carrier/web-ui/query'
import {
  AuditLogsTable,
  AuditLogsToolbar,
  useAuditLogSearch,
} from '@fuel-carrier/web-ui/audit-logs'
import {
  MEDIA_QUERIES,
  Pagination,
  QueryErrorState,
  ResourceListSkeleton,
  useMediaQuery,
} from '@fuel-carrier/web-ui/ui'
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
    queryKey: auditLogKeys.company(companyId, listParams),
    queryFn: function loadAuditLogs() {
      return fetchCompanyAuditLogs(companyId, listParams)
    },
    placeholderData: (previousData) => previousData,
  })
  const result = auditLogsQuery.data

  return (
    <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm md:p-6">
      <AuditLogsToolbar
        value={draftRange}
        onChange={handleRangeChange}
        labels={{
          dateRangeLabel: LL.common.dateRange.label(),
          dateRangePlaceholder: LL.common.dateRange.placeholder(),
        }}
      />
      {auditLogsQuery.isLoading && !result ? (
        <ResourceListSkeleton
          variant={isMdUp ? 'table' : 'cards'}
          columns={4}
          label={LL.internalPanel.companies.detail.auditLogsLoading()}
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
            ? LL.internalPanel.companies.detail.auditLogsEmptyFiltered()
            : LL.internalPanel.companies.detail.auditLogsEmpty()}
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
  )
}
