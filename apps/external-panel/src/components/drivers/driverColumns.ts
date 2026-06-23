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
        return `${driver.firstName} ${driver.lastName}`
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
