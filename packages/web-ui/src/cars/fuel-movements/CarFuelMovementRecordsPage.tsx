import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  LocalizedDateTimeRangePicker,
  MEDIA_QUERIES,
  Pagination,
  QueryErrorState,
  useMediaQuery,
} from '../../ui'
import { useCarTelemetryRecordsSearch } from '../telemetry-records/useCarTelemetryRecordsSearch'
import { CarFuelMovementList } from './CarFuelMovementList'
import { CarFuelMovementListSkeleton } from './CarFuelMovementListSkeleton'
import { useCarFuelMovements } from './useCarFuelMovements'

type CarFuelMovementRecordsPageProps = {
  carId: string
}

export function CarFuelMovementRecordsPage({
  carId,
}: CarFuelMovementRecordsPageProps) {
  const { LL } = useI18nContext()
  const labels = LL.common.carFuelMovements
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
  const movementsQuery = useCarFuelMovements({
    carId,
    page,
    limit,
    start,
    end,
  })
  const result = movementsQuery.data

  function renderBody() {
    if (movementsQuery.isLoading && !result) {
      return (
        <CarFuelMovementListSkeleton
          variant={isMdUp ? 'table' : 'cards'}
          label={labels.loading()}
        />
      )
    }

    if (movementsQuery.isError || !result) {
      return (
        <QueryErrorState
          onRetry={() => {
            void movementsQuery.refetch()
          }}
          labels={{
            loadFailed: LL.common.queryError.loadFailed(),
            retry: LL.common.queryError.retry(),
          }}
        />
      )
    }

    if (result.totalItems === 0) {
      return (
        <p className="text-sm text-base-content/50">
          {start && end ? labels.empty() : labels.emptyAll()}
        </p>
      )
    }

    return (
      <div
        className={
          movementsQuery.isFetching ? 'opacity-60 transition-opacity' : undefined
        }
      >
        <CarFuelMovementList movements={result.items} />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          totalItems={result.totalItems}
          limit={result.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          labels={LL.common.pagination}
        />
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm md:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{labels.title()}</h2>
        <p className="text-sm text-base-content/50">{labels.subtitle()}</p>
      </div>
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
