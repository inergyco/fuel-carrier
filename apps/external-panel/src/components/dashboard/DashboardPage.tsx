import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CarTelemetryMarker, FuelGradeFilter } from '@fuel-carrier/shared-types'
import { api, fetchAllPaginated } from '@fuel-carrier/web-ui/api'
import {
  mapPopupActionClassName,
  TrajectoryMapView,
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
import { useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { carKeys, fetchCars } from '../../lib/api/cars'
import { driverKeys, fetchDrivers } from '../../lib/api/drivers'
import { DashboardCarCard } from './car-card'
import { FleetStatsSection } from './FleetStatsSection'
import { FuelLevelRingSection } from './FuelLevelRingSection'

export function DashboardPage() {
  const { LL } = useI18nContext()
  const queryClient = useQueryClient()
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
          void telemetryQuery.refetch();
          void queryClient.invalidateQueries({ queryKey: carKeys.stats });
        }}
        labels={{
          offline: LL.common.connectivity.offline(),
          loadFailed: LL.common.connectivity.loadFailed(),
          retry: LL.common.connectivity.retry(),
        }}
      />

      <FleetStatsSection />

      <div className="flex min-h-0 flex-col gap-3 lg:flex-row lg:items-stretch">
        <TrajectoryMapView
          className="h-[40svh] min-h-56 w-full flex-1 overflow-hidden rounded-2xl border border-base-content/8 lg:h-auto lg:min-h-72"
          api={api}
          cars={carsQuery.data ?? []}
          markers={telemetryQuery.data ?? []}
          isLoading={telemetryQuery.isLoading || carsQuery.isLoading}
          labels={LL.externalPanel.map}
          renderVehicleLink={renderVehicleLink}
          titleAs="h2"
        />
        <FuelLevelRingSection className="w-full shrink-0 lg:w-72 xl:w-80" />
      </div>

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
                    : null;

                  return (
                    <li key={car.id}>
                      <DashboardCarCard
                        car={car}
                        driver={driver}
                        telemetry={telemetryByCarId.get(car.id) ?? null}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
