import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { AuthSession, CarLocationMarker } from '@fuel-carrier/shared-types'
import { FleetMapView } from '@fuel-carrier/web-ui/map'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import {
  carLocationKeys,
  fetchCarLocations,
} from '../../lib/api/car-locations'
import { carKeys, fetchCars } from '../../lib/api/cars'
import { driverKeys, fetchDrivers } from '../../lib/api/drivers'
import { DashboardCarCard } from './DashboardCarCard'

export type DashboardPageProps = {
  user: AuthSession
}

export function DashboardPage({ user }: DashboardPageProps) {
  const { LL } = useI18nContext()

  const carsQuery = useQuery({
    queryKey: carKeys.all,
    queryFn: fetchCars,
  })

  const driversQuery = useQuery({
    queryKey: driverKeys.all,
    queryFn: fetchDrivers,
  })

  const locationsQuery = useQuery({
    queryKey: carLocationKeys.all,
    queryFn: fetchCarLocations,
    refetchInterval: 30_000,
  })

  const driverNameById = useMemo(
    function mapDriverNames() {
      return new Map(
        (driversQuery.data ?? []).map(function toDriverEntry(driver) {
          return [driver.id, `${driver.firstName} ${driver.lastName}`]
        }),
      )
    },
    [driversQuery.data],
  )

  const locationByCarId = useMemo(
    function mapLocations() {
      return new Map(
        (locationsQuery.data ?? []).map(function toLocationEntry(marker) {
          return [marker.carId, marker]
        }),
      )
    },
    [locationsQuery.data],
  )

  const cars = carsQuery.data ?? []
  const isCarsLoading = carsQuery.isLoading

  function renderVehicleLink(marker: CarLocationMarker) {
    return (
      <Link
        to="/cars/$carId"
        params={{ carId: marker.carId }}
        className="inline-flex text-xs font-medium text-primary hover:underline"
      >
        {LL.externalPanel.map.viewVehicle()}
      </Link>
    )
  }

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          {LL.externalPanel.home.title()}
        </h1>
        <p className="mt-1 text-sm text-base-content/50">
          {LL.externalPanel.home.welcome({ firstName: user.firstName })}
        </p>
      </header>

      <FleetMapView
        className="h-[40svh] min-h-56 shrink-0 overflow-hidden rounded-2xl border border-base-content/8"
        markers={locationsQuery.data ?? []}
        isLoading={locationsQuery.isLoading}
        labels={LL.externalPanel.map}
        renderVehicleLink={renderVehicleLink}
        titleAs="h2"
      />

      <section className="flex-1">
        <p className="mb-5 text-xs text-base-content/40">
          {isCarsLoading
            ? LL.externalPanel.cars.loading()
            : LL.externalPanel.home.fleetSummary({ count: cars.length })}
        </p>

        {isCarsLoading ? (
          <p className="text-sm text-base-content/50">
            {LL.externalPanel.cars.loading()}
          </p>
        ) : cars.length === 0 ? (
          <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
            {LL.externalPanel.cars.empty()}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cars.map(function renderCarCard(car) {
              const driverName = car.driverId
                ? (driverNameById.get(car.driverId) ?? null)
                : null

              return (
                <li key={car.id}>
                  <DashboardCarCard
                    car={car}
                    driverName={driverName}
                    location={locationByCarId.get(car.id) ?? null}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
