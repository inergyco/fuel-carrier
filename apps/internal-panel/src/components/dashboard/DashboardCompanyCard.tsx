import type {
  Car,
  CarTelemetryMarker,
  Company,
  Driver,
} from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { formatVolume } from '@fuel-carrier/web-ui/cars'
import {
  CompanyBrandLogo,
  ICON_STROKE_WIDTH,
} from '@fuel-carrier/web-ui/ui'
import {
  ArrowRight,
  Droplets,
  MapPin,
  Phone,
  Truck,
  User,
} from '@fuel-carrier/web-ui/icons'
import { Link } from '@tanstack/react-router'

export type DashboardCompanyCardProps = {
  company: Company
  cars: Car[]
  drivers: Driver[]
  telemetryByCarId: Map<string, CarTelemetryMarker>
}

export function DashboardCompanyCard({
  company,
  cars,
  drivers,
  telemetryByCarId,
}: DashboardCompanyCardProps) {
  const { LL } = useI18nContext()
  const empty = LL.internalPanel.companies.emptyCell()
  const liveCount = cars.filter(function isLive(car) {
    return telemetryByCarId.has(car.id)
  }).length

  const driverNameById = new Map(
    drivers.map(function toDriverEntry(driver) {
      return [driver.id, `${driver.firstName} ${driver.lastName}`]
    }),
  )

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-xl sm:p-5">
      <div className="flex items-start gap-3">
        <CompanyBrandLogo logoUrl={company.logoUrl} />
        <div className="min-w-0 flex-1">
          <Link
            to="/companies/$companyId"
            params={{ companyId: company.id }}
            className="block truncate text-base font-semibold tracking-tight text-base-content transition-colors hover:text-primary"
          >
            {company.name}
          </Link>
          <p className="mt-0.5 font-mono text-xs text-base-content/45">
            {company.nationalId}
          </p>
        </div>
      </div>

      <dl className="grid gap-2 text-xs text-base-content/55 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-2">
          <Phone
            className="size-3.5 shrink-0"
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          <dt className="sr-only">{LL.internalPanel.companies.phoneNumber()}</dt>
          <dd className="truncate">{company.phoneNumber}</dd>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
          <MapPin
            className="size-3.5 shrink-0"
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          <dt className="sr-only">{LL.internalPanel.companies.address()}</dt>
          <dd className="truncate">{company.address ?? empty}</dd>
        </div>
      </dl>

      {company.note?.trim() ? (
        <p className="line-clamp-2 text-xs text-base-content/45">{company.note}</p>
      ) : null}

      <div className="flex flex-wrap gap-2 text-[0.7rem] tracking-wide text-base-content/50 uppercase">
        <span className="rounded-lg border border-base-content/8 bg-base-100/50 px-2.5 py-1">
          {LL.internalPanel.home.vehiclesCount({ count: cars.length })}
        </span>
        <span className="rounded-lg border border-base-content/8 bg-base-100/50 px-2.5 py-1">
          {LL.internalPanel.home.driversCount({ count: drivers.length })}
        </span>
        <span className="rounded-lg border border-base-content/8 bg-base-100/50 px-2.5 py-1">
          {LL.internalPanel.home.liveCount({ count: liveCount })}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-base-content/8 pt-4">
        {cars.length === 0 ? (
          <p className="text-sm text-base-content/45">
            {LL.internalPanel.home.noVehicles()}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {cars.map(function renderCarRow(car) {
              const telemetry = telemetryByCarId.get(car.id) ?? null
              const title = car.name?.trim()
                ? car.name
                : LL.internalPanel.map.unnamedVehicle()
              const driverName = car.driverId
                ? (driverNameById.get(car.driverId) ?? null)
                : null

              return (
                <li key={car.id}>
                  <Link
                    to="/companies/$companyId/cars/$carId"
                    params={{ companyId: company.id, carId: car.id }}
                    className="group flex items-start gap-3 rounded-xl border border-base-content/6 bg-base-100/40 px-3 py-2.5 transition-all hover:border-primary/25 hover:bg-base-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                      <Truck
                        className="size-4"
                        strokeWidth={ICON_STROKE_WIDTH}
                        aria-hidden
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium tracking-tight">
                          {title}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.7rem] text-base-content/50">
                          <span
                            aria-hidden
                            className={
                              telemetry
                                ? 'size-1.5 rounded-full bg-success'
                                : 'size-1.5 rounded-full bg-base-content/30'
                            }
                          />
                          {telemetry
                            ? LL.internalPanel.home.vehicleLive()
                            : LL.internalPanel.home.vehicleOffline()}
                        </span>
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-base-content/50">
                        {car.licensePlate}
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/50">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <User
                            className="size-3.5 shrink-0"
                            strokeWidth={ICON_STROKE_WIDTH}
                            aria-hidden
                          />
                          <span className="truncate">
                            {driverName ??
                              LL.internalPanel.home.unassignedDriver()}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Droplets
                            className="size-3.5 shrink-0"
                            strokeWidth={ICON_STROKE_WIDTH}
                            aria-hidden
                          />
                          {telemetry?.remainFuel != null
                            ? LL.internalPanel.map.remainFuel({
                                volume: formatVolume(telemetry.remainFuel),
                              })
                            : LL.internalPanel.companies.detail.remainFuelUnknown()}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Link
        to="/companies/$companyId"
        params={{ companyId: company.id }}
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary transition-opacity hover:opacity-80"
      >
        {LL.internalPanel.home.viewCompany()}
        <ArrowRight
          className="size-4 rtl:rotate-180"
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
      </Link>
    </article>
  )
}
