import type { Car } from '@fuel-carrier/shared-types'
import type { TranslationFunctions } from '@fuel-carrier/i18n'
import type { ResourceColumn } from '../users/ResourceSection'

interface CarColumnOptions {
  LL: TranslationFunctions
  emptyCell?: string
  driverNameById: Map<string, string>
}

export function getCarColumns({
  LL,
  emptyCell,
  driverNameById,
}: CarColumnOptions): ResourceColumn<Car>[] {
  return [
    {
      key: 'licensePlate',
      header: LL.externalPanel.cars.licensePlate(),
      cell: function renderLicensePlate(car) {
        return car.licensePlate
      },
      className: 'font-mono text-sm font-medium',
    },
    {
      key: 'name',
      header: LL.externalPanel.cars.name(),
      cell: function renderName(car) {
        return car.name ?? emptyCell
      },
    },
    {
      key: 'driver',
      header: LL.externalPanel.cars.driver(),
      cell: function renderDriver(car) {
        return car.driverId
          ? (driverNameById.get(car.driverId) ?? LL.externalPanel.cars.noDriver())
          : LL.externalPanel.cars.noDriver()
      },
    },
    {
      key: 'note',
      header: LL.externalPanel.cars.note(),
      cell: function renderNote(car) {
        return car.note ?? emptyCell
      },
      className: 'max-w-56 truncate',
    },
  ]
}
