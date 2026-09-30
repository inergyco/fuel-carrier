import type {
  Car,
  CarTelemetryMarker,
  Driver,
} from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { carFuelTypeLabel } from '@fuel-carrier/web-ui/cars'
import { CarCardDetails } from './CarCardDetails'
import { CarCardFooter } from './CarCardFooter'
import { CarCardFuelSection } from './CarCardFuelSection'
import { CarCardHeader } from './CarCardHeader'
import { CarCardWatermark } from './CarCardWatermark'
import {
  getCarCardLiveness,
  getFuelFillPercent,
  getRemainFuelLiters,
} from './car-card-utils'

export type DashboardCarCardProps = {
  car: Car
  driver: Driver | null
  telemetry: CarTelemetryMarker | null
}

export function DashboardCarCard({
  car,
  driver,
  telemetry,
}: DashboardCarCardProps) {
  const { LL } = useI18nContext()

  const remainFuel = getRemainFuelLiters(telemetry)
  const fillPercent = getFuelFillPercent(remainFuel)
  const liveness = getCarCardLiveness(telemetry)
  const isLive = liveness === 'live'

  const statusLabel = isLive
    ? LL.externalPanel.home.locationLive()
    : LL.externalPanel.home.statusOffline()

  const driverName = driver
    ? `${driver.firstName} ${driver.lastName}`
    : LL.externalPanel.cars.noDriver()

  const mobileNumber =
    driver?.mobileNumber?.trim() || LL.externalPanel.home.mobileUnknown()

  const fuelTypeLabel = carFuelTypeLabel(
    car.hasHighGrade,
    LL.externalPanel.cars,
  )

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/15 bg-base-100 shadow-[0_8px_28px_-18px] shadow-base-content/25">
      {fillPercent != null && remainFuel != null ? (
        <CarCardWatermark fillPercent={fillPercent} remainFuel={remainFuel} />
      ) : null}

      <CarCardHeader
        licensePlate={car.licensePlate}
        liveness={liveness}
        statusLabel={statusLabel}
      />

      <div className="relative z-10 flex flex-1 flex-col gap-2.5 px-4 pt-3">
        <CarCardDetails
          driverName={driverName}
          mobileNumber={mobileNumber}
          locationLabel={statusLabel}
          fuelTypeLabel={fuelTypeLabel}
        />
        <CarCardFuelSection
          remainFuel={remainFuel}
          fillPercent={fillPercent}
        />
      </div>

      <CarCardFooter carId={car.id} />
    </article>
  )
}
