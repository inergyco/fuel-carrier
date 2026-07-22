import type { Car, CarLocationMarker } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ICON_STROKE_WIDTH } from '@fuel-carrier/web-ui/ui'
import { MapPin, Truck, User } from '@fuel-carrier/web-ui/icons'
import { Link } from '@tanstack/react-router'

export type DashboardCarCardProps = {
  car: Car
  driverName: string | null
  location: CarLocationMarker | null
}

export function DashboardCarCard({
  car,
  driverName,
  location,
}: DashboardCarCardProps) {
  const { LL } = useI18nContext()
  const title = car.name?.trim()
    ? car.name
    : LL.externalPanel.map.unnamedVehicle()

  return (
    <Link
      to="/cars/$carId"
      params={{ carId: car.id }}
      className="group flex flex-col gap-3 rounded-2xl border border-base-content/8 bg-base-200/40 p-4 backdrop-blur-xl transition-all hover:border-primary/25 hover:bg-base-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 h-full"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:border-primary/35 group-hover:bg-primary/15">
          <Truck className="h-5 w-5" strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight text-base-content">
            {title}
          </p>
          <p className="mt-0.5 font-mono text-xs text-base-content/55">
            {car.licensePlate}
          </p>
        </div>
      </div>

      <dl className="space-y-2 text-xs text-base-content/55">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 shrink-0" strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          <dt className="sr-only">{LL.externalPanel.cars.driver()}</dt>
          <dd className="truncate">
            {driverName ?? LL.externalPanel.cars.noDriver()}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          <dt className="sr-only">{LL.externalPanel.home.location()}</dt>
          <dd className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className={
                location
                  ? 'size-1.5 rounded-full bg-success'
                  : 'size-1.5 rounded-full bg-base-content/30'
              }
            />
            {location
              ? LL.externalPanel.home.locationLive()
              : LL.externalPanel.home.locationUnknown()}
          </dd>
        </div>
      </dl>

      {car.note?.trim() ? (
        <p className="line-clamp-2 border-t border-base-content/6 pt-3 text-xs text-base-content/45">
          {car.note}
        </p>
      ) : null}
    </Link>
  )
}
