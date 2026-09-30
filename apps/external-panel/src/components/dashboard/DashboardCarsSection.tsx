import { useI18nContext } from '@fuel-carrier/i18n/react'
import type {
  CarTelemetryMarker,
  FuelGradeFilter,
  ResourceListParams,
} from '@fuel-carrier/shared-types'
import { fetchAllPaginated } from '@fuel-carrier/web-ui/api'
import {
  DashboardCardsSkeleton,
  FuelGradeFilterControl,
  Pagination,
} from '@fuel-carrier/web-ui/ui'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { useMemo, useState } from 'react'
import { carKeys, fetchCars } from '../../lib/api/cars'
import { driverKeys, fetchDrivers } from '../../lib/api/drivers'
import { DashboardCarCard } from './car-card'

const DASHBOARD_CARS_PAGE_SIZE = 4

const CAR_GRID_CLASS_NAME =
  'grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'

type DashboardCarsSectionProps = {
  telemetryMarkers: CarTelemetryMarker[]
}

export function DashboardCarsSection({
  telemetryMarkers,
}: DashboardCarsSectionProps) {
  const { LL } = useI18nContext()
  const [page, setPage] = useState(1)
  const [fuelGrade, setFuelGrade] = useState<FuelGradeFilter>('all')

  const listParams: ResourceListParams = {
    page,
    limit: DASHBOARD_CARS_PAGE_SIZE,
    fuelGrade,
  }

  const carsQuery = useQuery({
    queryKey: carKeys.list(listParams),
    queryFn: () => fetchCars(listParams),
    placeholderData: (previous) => previous,
  })

  const driversQuery = useQuery({
    queryKey: [...driverKeys.all, 'all'] as const,
    queryFn: () => fetchAllPaginated(fetchDrivers),
  })

  const driverById = useMemo(
    function mapDrivers() {
      return new Map(
        (driversQuery.data ?? []).map(function toDriverEntry(driver) {
          return [driver.id, driver]
        }),
      )
    },
    [driversQuery.data],
  )

  const telemetryByCarId = useMemo(
    function mapTelemetry() {
      return new Map(
        telemetryMarkers.map(function toTelemetryEntry(marker) {
          return [marker.carId, marker]
        }),
      )
    },
    [telemetryMarkers],
  )

  const carsResult = carsQuery.data
  const cars = carsResult?.items ?? []
  const totalItems = carsResult?.totalItems ?? 0
  const isCarsLoading = carsQuery.isLoading && !carsResult

  function handleFuelGradeChange(nextFuelGrade: FuelGradeFilter) {
    setFuelGrade(nextFuelGrade)
    setPage(1)
  }

  if (isCarsLoading) {
    return (
      <section className="flex-1">
        <DashboardCardsSkeleton
          label={LL.externalPanel.cars.loading()}
          variant="car"
          columnsClassName={CAR_GRID_CLASS_NAME}
        />
      </section>
    )
  }

  if (totalItems === 0 && fuelGrade === 'all') {
    return (
      <section className="flex-1">
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
          {LL.externalPanel.cars.empty()}
        </div>
      </section>
    )
  }

  return (
    <section className="flex-1">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end justify-between gap-3 sm:block">
          <h2 className="text-sm font-semibold tracking-tight text-base-content/80">
            {LL.externalPanel.home.vehicleStatusTitle()}
          </h2>
          <p className="text-xs text-base-content/40 sm:mt-1">
            {LL.externalPanel.home.fleetSummary({
              count: totalItems,
            })}
          </p>
        </div>
        <FuelGradeFilterControl
          value={fuelGrade}
          onChange={handleFuelGradeChange}
        />
      </div>

      {cars.length === 0 ? (
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
          {LL.externalPanel.cars.emptyFiltered()}
        </div>
      ) : (
        <>
          <ul className={`grid ${CAR_GRID_CLASS_NAME}`}>
            {cars.map(function renderCarCard(car) {
              const driver = car.driverId
                ? (driverById.get(car.driverId) ?? null)
                : null

              return (
                <li key={car.id}>
                  <DashboardCarCard
                    car={car}
                    driver={driver}
                    telemetry={telemetryByCarId.get(car.id) ?? null}
                  />
                </li>
              )
            })}
          </ul>
          {carsResult ? (
            <Pagination
              className="mt-4"
              page={carsResult.page}
              totalPages={carsResult.totalPages}
              totalItems={carsResult.totalItems}
              limit={carsResult.limit}
              onPageChange={setPage}
              showLimitSelect={false}
              labels={LL.common.pagination}
            />
          ) : null}
        </>
      )}
    </section>
  )
}
