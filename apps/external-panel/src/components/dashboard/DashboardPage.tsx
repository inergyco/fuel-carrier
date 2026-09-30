import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CarTelemetryMarker, FuelGradeFilter } from '@fuel-carrier/shared-types'
import { api, fetchAllPaginated } from '@fuel-carrier/web-ui/api'
import {
  FleetMapView,
  mapPopupActionClassName,
  useCarTelemetryLive,
} from '@fuel-carrier/web-ui/map'
import {
  buttonClassName,
  ConnectivityBanner,
  DashboardCardsSkeleton,
  FuelGradeFilterControl,
  useNavigatorOnline,
} from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { carKeys, fetchCars } from '../../lib/api/cars'
import { driverKeys, fetchDrivers } from '../../lib/api/drivers'
import { DashboardCarCard } from './DashboardCarCard'

export function DashboardPage() {
  const { LL } = useI18nContext()
  const [fuelGrade, setFuelGrade] = useState<FuelGradeFilter>('all')

  const carsQuery = useQuery({
    queryKey: [...carKeys.all, 'all'] as const,
    queryFn: () => fetchAllPaginated(fetchCars),
  })

  const driversQuery = useQuery({
    queryKey: [...driverKeys.all, 'all'] as const,
    queryFn: () => fetchAllPaginated(fetchDrivers),
  })

  const telemetryQuery = useCarTelemetryLive(api)
  const isOnline = useNavigatorOnline()

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
        (telemetryQuery.data ?? []).map(function toTelemetryEntry(marker) {
          return [marker.carId, marker]
        }),
      )
    },
    [telemetryQuery.data],
  )

  const cars = carsQuery.data ?? []
  const filteredCars =
    fuelGrade === 'highGrade'
      ? cars.filter((car) => car.hasHighGrade)
      : fuelGrade === 'normal'
        ? cars.filter((car) => !car.hasHighGrade)
        : cars
  const isCarsLoading = carsQuery.isLoading

  function renderVehicleLink(marker: CarTelemetryMarker) {
    return (
      <Link
        to="/cars/$carId"
        params={{ carId: marker.carId }}
        className={cn(buttonClassName.outline, mapPopupActionClassName)}
      >
        {LL.externalPanel.map.viewVehicle()}
      </Link>
    )
  }

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <ConnectivityBanner
        isOnline={isOnline}
        isQueryError={telemetryQuery.isError}
        onRetry={() => {
          void telemetryQuery.refetch()
        }}
        labels={{
          offline: LL.common.connectivity.offline(),
          loadFailed: LL.common.connectivity.loadFailed(),
          retry: LL.common.connectivity.retry(),
        }}
      />

      <FleetMapView
        className="h-[40svh] min-h-56 shrink-0 overflow-hidden rounded-2xl border border-base-content/8"
        markers={telemetryQuery.data ?? []}
        isLoading={telemetryQuery.isLoading}
        labels={LL.externalPanel.map}
        renderVehicleLink={renderVehicleLink}
        titleAs="h2"
      />

      <section className="flex-1">
        {isCarsLoading ? (
          <DashboardCardsSkeleton
            label={LL.externalPanel.cars.loading()}
            variant="car"
            columnsClassName="grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          />
        ) : cars.length === 0 ? (
          <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
            {LL.externalPanel.cars.empty()}
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end justify-between gap-3 sm:block">
                <h2 className="text-sm font-semibold tracking-tight text-base-content/80">
                  {LL.externalPanel.home.vehicleStatusTitle()}
                </h2>
                <p className="text-xs text-base-content/40 sm:mt-1">
                  {LL.externalPanel.home.fleetSummary({
                    count: filteredCars.length,
                  })}
                </p>
              </div>
              <FuelGradeFilterControl
                value={fuelGrade}
                onChange={setFuelGrade}
                labels={{
                  all: LL.common.listFilters.fuelGradeAll,
                  highGrade: LL.common.listFilters.fuelGradeHighGrade,
                  normal: LL.common.listFilters.fuelGradeNormal,
                  filterLabel: LL.common.listFilters.fuelGradeFilterLabel,
                }}
              />
            </div>
            {filteredCars.length === 0 ? (
              <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
                {LL.externalPanel.cars.emptyFiltered()}
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredCars.map(function renderCarCard(car) {
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
            )}
          </>
        )}
      </section>
    </div>
  )
}
