import type { Car, Driver } from '@fuel-carrier/shared-types'
import type { TranslationFunctions } from '@fuel-carrier/i18n'
import type { ResourceColumn } from '../users/ResourceSection'

interface DriverColumnOptions {
  LL: TranslationFunctions
  emptyCell?: string
}

function formatCarLabel(car: Car): string {
  return car.name ? `${car.name} (${car.licensePlate})` : car.licensePlate
}

export function getDriverColumns({
  LL,
  emptyCell,
}: DriverColumnOptions): ResourceColumn<Driver>[] {
  return [
    {
      key: 'name',
      header: LL.externalPanel.drivers.name(),
      cell: function renderName(driver) {
        return (
          <span className="inline-flex items-center gap-2.5">
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-content/10 bg-base-100/60">
              {driver.imageUrl ? (
                <img
                  src={driver.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-base-content/40">
                  {driver.firstName.charAt(0)}
                  {driver.lastName.charAt(0)}
                </span>
              )}
            </span>
            <span>
              {driver.firstName} {driver.lastName}
            </span>
          </span>
        )
      },
    },
    {
      key: 'nationalId',
      header: LL.externalPanel.drivers.nationalId(),
      cell: function renderNationalId(driver) {
        return driver.nationalId ?? emptyCell
      },
      className: 'font-mono text-sm',
    },
    {
      key: 'mobileNumber',
      header: LL.externalPanel.drivers.mobileNumber(),
      cell: function renderMobileNumber(driver) {
        return driver.mobileNumber ?? emptyCell
      },
      className: 'font-mono text-sm',
    },
    {
      key: 'car',
      header: LL.externalPanel.drivers.car(),
      cell: function renderCar(driver) {
        return driver.car
          ? formatCarLabel(driver.car)
          : (emptyCell ?? LL.externalPanel.drivers.noCar())
      },
    },
  ]
}
