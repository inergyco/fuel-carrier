import type { Car, CarTelemetryMarker } from '@fuel-carrier/shared-types'
import type { ReactNode } from 'react'
import { carFuelTypeLabel, formatVolume } from '../../cars'
import { CAR_CARD_SHELL_CLASS_NAME } from '../../ui/car-card-shell'
import { CarCardDetails } from './CarCardDetails'
import { CarCardFooter } from './CarCardFooter'
import { CarCardFuelSection } from './CarCardFuelSection'
import { CarCardHeader } from './CarCardHeader'
import { CarCardWatermark } from './CarCardWatermark'
import type { CarCardLabels } from './car-card-labels'
import {
  CAR_CARD_TOTAL_CAPACITY_LITERS,
  getFuelFillPercent,
  getRemainFuelLiters,
} from './car-card-utils'
import { useCarCardLiveness } from './useCarCardLiveness'

export type CarCardProps = {
  car: Car
  telemetry: CarTelemetryMarker | null
  labels: CarCardLabels
  detailsLink: ReactNode
  actions?: ReactNode
}

export function CarCard({
  car,
  telemetry,
  labels,
  detailsLink,
  actions,
}: CarCardProps) {
  const liveness = useCarCardLiveness(telemetry)
  const isLive = liveness === 'live'

  const remainFuel = getRemainFuelLiters(telemetry)
  const fillPercent = getFuelFillPercent(remainFuel)

  const statusLabel = isLive ? labels.locationLive() : labels.statusOffline()

  const driverName = car.driver
    ? `${car.driver.firstName} ${car.driver.lastName}`
    : labels.noDriver()

  const mobileNumber =
    car.driver?.mobileNumber?.trim() || labels.mobileUnknown()

  const fuelTypeLabel = carFuelTypeLabel(car.hasHighGrade, labels.fuelType)

  const fuelVolumeLabel =
    remainFuel != null
      ? labels.fuelVolumeOfCapacity({
          volume: formatVolume(remainFuel),
          capacity: formatVolume(CAR_CARD_TOTAL_CAPACITY_LITERS),
          unit: labels.tankUnit(),
        })
      : null

  return (
    <article className={CAR_CARD_SHELL_CLASS_NAME}>
      <CarCardWatermark fillPercent={fillPercent} remainFuel={remainFuel} />

      <CarCardHeader
        licensePlate={car.licensePlate}
        liveness={liveness}
        statusLabel={statusLabel}
        highGradeLabel={
          car.hasHighGrade ? labels.fuelType.fuelTypeHighGrade() : undefined
        }
      />

      <div className="relative z-10 flex flex-1 flex-col gap-2.5 px-4 pt-3">
        <CarCardDetails
          driverName={driverName}
          mobileNumber={mobileNumber}
          fuelTypeLabel={fuelTypeLabel}
        />
        <CarCardFuelSection
          remainFuel={remainFuel}
          fillPercent={fillPercent}
          remainFuelUnknown={labels.remainFuelUnknown()}
          fuelVolumeLabel={fuelVolumeLabel}
        />
      </div>

      <CarCardFooter detailsLink={detailsLink} actions={actions} />
    </article>
  )
}
