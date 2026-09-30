import type { Car } from '@fuel-carrier/shared-types'
import type { TranslationFunctions } from '@fuel-carrier/i18n'
import { carFuelTypeLabel } from '@fuel-carrier/web-ui/cars'
import type { ResourceColumn } from '../users/ResourceSection'

interface CarColumnOptions {
  LL: TranslationFunctions
  emptyCell?: string
}

export function getCarColumns({
  LL,
  emptyCell,
}: CarColumnOptions): ResourceColumn<Car>[] {
  const cars = LL.externalPanel.cars

  return [
    {
      key: 'licensePlate',
      header: cars.licensePlate(),
      cell: function renderLicensePlate(car) {
        return car.licensePlate
      },
      className: 'font-mono text-sm font-medium',
    },
    {
      key: 'name',
      header: cars.name(),
      cell: function renderName(car) {
        return car.name ?? emptyCell
      },
    },
    {
      key: 'driver',
      header: cars.driver(),
      cell: function renderDriver(car) {
        return car.driver
          ? `${car.driver.firstName} ${car.driver.lastName}`
          : cars.noDriver()
      },
    },
    {
      key: 'fuelType',
      header: cars.fuelType(),
      cell: function renderFuelType(car) {
        return carFuelTypeLabel(car.hasHighGrade, cars)
      },
    },
    {
      key: 'note',
      header: cars.note(),
      cell: function renderNote(car) {
        return car.note ?? emptyCell
      },
      className: 'max-w-56 truncate',
    },
  ]
}
