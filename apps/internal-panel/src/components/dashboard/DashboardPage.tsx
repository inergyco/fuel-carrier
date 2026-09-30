import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Car, Company } from '@fuel-carrier/shared-types'
import { api, fetchAllPaginated } from '@fuel-carrier/web-ui/api'
import { useCarTelemetryLive } from '@fuel-carrier/web-ui/map'
import {
  ConnectivityBanner,
  DashboardCardsSkeleton,
  useNavigatorOnline,
} from '@fuel-carrier/web-ui/ui'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { useMemo } from 'react'
import { carKeys, fetchAllCars } from '../../lib/api/cars'
import { companyKeys, fetchCompanies } from '../../lib/api/companies'
import { driverKeys, fetchAllDrivers } from '../../lib/api/drivers'
import { DashboardCompanyCard } from './DashboardCompanyCard'

export function DashboardPage() {
  const { LL } = useI18nContext()

  const companiesQuery = useQuery({
    queryKey: companyKeys.all,
    queryFn: () => fetchAllPaginated(fetchCompanies),
  })

  const carsQuery = useQuery({
    queryKey: carKeys.all,
    queryFn: () => fetchAllCars(),
  })

  const driversQuery = useQuery({
    queryKey: driverKeys.all,
    queryFn: () => fetchAllDrivers(),
  })

  const telemetryQuery = useCarTelemetryLive(api)
  const isOnline = useNavigatorOnline()

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

  const carsByCompanyId = useMemo(
    function groupCars() {
      const grouped = new Map<string, Car[]>()
      for (const car of carsQuery.data ?? []) {
        const existing = grouped.get(car.companyId)
        if (existing) {
          existing.push(car)
        } else {
          grouped.set(car.companyId, [car])
        }
      }
      return grouped
    },
    [carsQuery.data],
  )

  const driversCountByCompanyId = useMemo(
    function countDrivers() {
      const counts = new Map<string, number>()
      for (const driver of driversQuery.data ?? []) {
        counts.set(driver.companyId, (counts.get(driver.companyId) ?? 0) + 1)
      }
      return counts
    },
    [driversQuery.data],
  )

  const companies = companiesQuery.data ?? []
  const cars = carsQuery.data ?? []
  const isLoading =
    companiesQuery.isLoading || carsQuery.isLoading || driversQuery.isLoading

  const liveCount = useMemo(
    function countLiveCars() {
      return cars.filter(function isLive(car) {
        return telemetryByCarId.has(car.id)
      }).length
    },
    [cars, telemetryByCarId],
  )

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

      {isLoading ? (
        <DashboardCardsSkeleton
          label={LL.internalPanel.home.loading()}
          count={4}
          columnsClassName="grid-cols-1 gap-4 lg:grid-cols-2"
        />
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
          {LL.internalPanel.home.empty()}
        </div>
      ) : (
        <>
          <p className="text-xs text-base-content/40">
            {LL.internalPanel.home.summary({
              companies: companies.length,
              vehicles: cars.length,
              live: liveCount,
            })}
          </p>

          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {companies.map(function renderCompanyCard(company: Company) {
              return (
                <li key={company.id}>
                  <DashboardCompanyCard
                    company={company}
                    cars={carsByCompanyId.get(company.id) ?? []}
                    driversCount={driversCountByCompanyId.get(company.id) ?? 0}
                    telemetryByCarId={telemetryByCarId}
                  />
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
