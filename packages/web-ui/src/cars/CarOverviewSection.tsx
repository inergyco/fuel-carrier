import type { Car } from '@fuel-carrier/shared-types'
import { Fuel, User } from '../icons'
import { ICON_STROKE_WIDTH, iconSmClassName } from '../ui/iconClassName'

export type CarFuelTypeLabels = {
  fuelTypeHighGrade: () => string
  fuelTypeNormal: () => string
}

export function carFuelTypeLabel(
  hasHighGrade: boolean,
  labels: CarFuelTypeLabels,
): string {
  return hasHighGrade ? labels.fuelTypeHighGrade() : labels.fuelTypeNormal()
}

export type CarOverviewSectionLabels = {
  note: () => string
  driver: () => string
  noDriver: () => string
  fuelType: () => string
  fuelTypeHighGrade: () => string
  fuelTypeNormal: () => string
  emptyCell: () => string
}

export type CarOverviewSectionProps = {
  car: Car
  labels: CarOverviewSectionLabels
  currentDriverName?: string | null
}

export function CarOverviewSection({
  car,
  labels,
  currentDriverName,
}: CarOverviewSectionProps) {
  const emptyCell = labels.emptyCell()
  const driverDisplay =
    currentDriverName?.trim() ||
    (car.driver
      ? `${car.driver.firstName} ${car.driver.lastName}`
      : car.driverId
        ? emptyCell
        : labels.noDriver())
  const note = car.note?.trim() || emptyCell

  return (
    <section className="overflow-hidden rounded-2xl border border-base-content/8 bg-panel-card backdrop-blur-sm">
      <dl>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex items-center gap-3 border-b border-base-content/8 px-4 py-3 sm:border-e sm:border-b-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-base-content/8 bg-base-100/40 text-primary">
              <User
                className={iconSmClassName}
                strokeWidth={ICON_STROKE_WIDTH}
                aria-hidden
              />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-base-content/45">{labels.driver()}</dt>
              <dd className="truncate text-sm font-medium">{driverDisplay}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-base-content/8 bg-base-100/40 text-primary">
              <Fuel
                className={iconSmClassName}
                strokeWidth={ICON_STROKE_WIDTH}
                aria-hidden
              />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-base-content/45">{labels.fuelType()}</dt>
              <dd className="truncate text-sm font-medium">
                {carFuelTypeLabel(car.hasHighGrade, labels)}
              </dd>
            </div>
          </div>
        </div>
        <div className="border-t border-base-content/8 px-4 py-3">
          <dt className="text-xs text-base-content/45">{labels.note()}</dt>
          <dd className="mt-1 text-sm whitespace-pre-wrap text-base-content/80">
            {note}
          </dd>
        </div>
      </dl>
    </section>
  )
}
