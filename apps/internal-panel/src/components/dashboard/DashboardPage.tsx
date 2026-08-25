import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { AuthSession, Car, Company, Driver } from '@fuel-carrier/shared-types'
import { api } from '@fuel-carrier/web-ui/api'
import { useCarTelemetryLive } from '@fuel-carrier/web-ui/map'
import { useQuery } from '@fuel-carrier/web-ui/query'
import { useMemo } from 'react'
import { carKeys, fetchCars } from '../../lib/api/cars'
import { companyKeys, fetchCompanies } from '../../lib/api/companies'
import { driverKeys, fetchDrivers } from '../../lib/api/drivers'
import { DashboardCompanyCard } from './DashboardCompanyCard'

export type DashboardPageProps = {
  user: AuthSession
}

export function DashboardPage({ user }: DashboardPageProps) {
  const { LL } = useI18nContext()

  const companiesQuery = useQuery({
    queryKey: companyKeys.all,
    queryFn: fetchCompanies,
  })

  const carsQuery = useQuery({
    queryKey: carKeys.all,
    queryFn: fetchCars,
  })

  const driversQuery = useQuery({
    queryKey: driverKeys.all,
    queryFn: fetchDrivers,
  })

  const telemetryQuery = useCarTelemetryLive(api)

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

  const driversByCompanyId = useMemo(
    function groupDrivers() {
      const grouped = new Map<string, Driver[]>()
      for (const driver of driversQuery.data ?? []) {
        const existing = grouped.get(driver.companyId)
        if (existing) {
          existing.push(driver)
        } else {
          grouped.set(driver.companyId, [driver])
        }
      }
      return grouped
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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {LL.internalPanel.home.title()}
        </h1>
        <p className="mt-1 text-sm text-base-content/50">
          {LL.internalPanel.home.welcome({ firstName: user.firstName })}
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-base-content/50">
          {LL.internalPanel.home.loading()}
        </p>
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
                    drivers={driversByCompanyId.get(company.id) ?? []}
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
