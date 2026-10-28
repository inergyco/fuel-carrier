import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CarTelemetry } from '@fuel-carrier/shared-types'
import { api } from '../../api'
import { useCarTelemetryHistory } from '../../map/useCarTelemetryHistory'
import {
  LocalizedDateTimeRangePicker,
  MEDIA_QUERIES,
  Pagination,
  QueryErrorState,
  ResourceListSkeleton,
  useMediaQuery,
} from '../../ui'
import { CarTelemetryRecordList } from './CarTelemetryRecordList'
import { useCarTelemetryRecordsSearch } from './useCarTelemetryRecordsSearch'

type CarTelemetryRecordsPageProps = {
  carId: string
}

export function CarTelemetryRecordsPage({
  carId,
}: CarTelemetryRecordsPageProps) {
  const { LL } = useI18nContext()
  const labels = LL.common.carTelemetry
  const isMdUp = useMediaQuery(MEDIA_QUERIES.mdUp)
  const {
    page,
    limit,
    start,
    end,
    draftRange,
    handleRangeChange,
    handlePageChange,
    handleLimitChange,
  } = useCarTelemetryRecordsSearch()
  const filters =
    start && end
      ? {
          carId,
          start,
          end,
        }
      : null
  const historyQuery = useCarTelemetryHistory(api, filters)
  const records = historyQuery.data
  const pageResult = records
    ? paginateTelemetryRecords({ records, page, limit })
    : null

  function renderBody() {
    if (!filters) {
      return (
        <p className="text-sm text-base-content/50">{labels.chooseRange()}</p>
      )
    }

    if (historyQuery.isLoading && !records) {
      return (
        <ResourceListSkeleton
          variant={isMdUp ? 'table' : 'cards'}
          columns={isMdUp ? 9 : 4}
          label={labels.loading()}
        />
      )
    }

    if (historyQuery.isError) {
      return (
        <QueryErrorState
          onRetry={() => {
            void historyQuery.refetch()
          }}
          labels={{
            loadFailed: LL.common.queryError.loadFailed(),
            retry: LL.common.queryError.retry(),
          }}
        />
      )
    }

    if ((records?.length ?? 0) === 0 || !pageResult) {
      return <p className="text-sm text-base-content/50">{labels.empty()}</p>
    }

    return (
      <div
        className={
          historyQuery.isFetching ? 'opacity-60 transition-opacity' : undefined
        }
      >
        <CarTelemetryRecordList records={pageResult.items} />
        <Pagination
          page={pageResult.page}
          totalPages={pageResult.totalPages}
          totalItems={pageResult.totalItems}
          limit={pageResult.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          labels={LL.common.pagination}
        />
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm md:p-6">
      <div className="mb-4 w-full min-w-0 sm:max-w-md">
        <LocalizedDateTimeRangePicker
          label={LL.common.dateRange.label()}
          value={draftRange}
          onChange={handleRangeChange}
          placeholder={LL.common.dateRange.placeholder()}
          maxDate={new Date()}
        />
      </div>
      {renderBody()}
    </section>
  )
}

function paginateTelemetryRecords({
  records,
  page,
  limit,
}: {
  records: CarTelemetry[]
  page: number
  limit: number
}) {
  const newestFirst = [...records].reverse()
  const totalItems = newestFirst.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const from = (safePage - 1) * limit

  return {
    items: newestFirst.slice(from, from + limit),
    page: safePage,
    totalPages: totalItems === 0 ? 0 : totalPages,
    totalItems,
    limit,
  }
}
