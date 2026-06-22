import type { Car, CompanyUser, Driver } from '@fuel-carrier/shared-types'
import type { TranslationFunctions } from '@fuel-carrier/i18n'
import type { ResourceColumn } from './ResourceSection'

interface CompanyResourceColumnOptions {
  LL: TranslationFunctions
  emptyCell: string
  driverNameById?: Map<string, string>
}

export function getUserColumns({
  LL,
  emptyCell,
}: CompanyResourceColumnOptions): ResourceColumn<CompanyUser>[] {
  return [
    {
      key: 'name',
      header: LL.internalPanel.companies.name(),
      cell: (user) => `${user.firstName} ${user.lastName}`,
    },
    {
      key: 'username',
      header: LL.internalPanel.companies.detail.username(),
      cell: (user) => user.username,
      className: 'font-mono text-sm',
    },
    {
      key: 'nationalId',
      header: LL.internalPanel.companies.nationalId(),
      cell: (user) => user.nationalId ?? emptyCell,
    },
    {
      key: 'email',
      header: LL.internalPanel.companies.detail.email(),
      cell: (user) => user.email ?? emptyCell,
    },
  ]
}

export function getDriverColumns({
  LL,
}: CompanyResourceColumnOptions): ResourceColumn<Driver>[] {
  return [
    {
      key: 'firstName',
      header: LL.internalPanel.companies.detail.firstName(),
      cell: (driver) => driver.firstName,
    },
    {
      key: 'lastName',
      header: LL.internalPanel.companies.detail.lastName(),
      cell: (driver) => driver.lastName,
    },
    {
      key: 'nationalId',
      header: LL.internalPanel.companies.nationalId(),
      cell: (driver) => driver.nationalId,
      className: 'font-mono text-sm',
    },
  ]
}

export function getCarColumns({
  LL,
  emptyCell,
  driverNameById,
}: CompanyResourceColumnOptions): ResourceColumn<Car>[] {
  return [
    {
      key: 'licensePlate',
      header: LL.internalPanel.companies.detail.licensePlate(),
      cell: (car) => car.licensePlate,
      className: 'font-mono text-sm font-medium',
    },
    {
      key: 'name',
      header: LL.internalPanel.companies.name(),
      cell: (car) => car.name ?? emptyCell,
    },
    {
      key: 'driver',
      header: LL.internalPanel.companies.detail.driver(),
      cell: (car) =>
        car.driverId
          ? (driverNameById?.get(car.driverId) ??
            LL.internalPanel.companies.detail.noDriver())
          : LL.internalPanel.companies.detail.noDriver(),
    },
    {
      key: 'note',
      header: LL.internalPanel.companies.note(),
      cell: (car) => car.note ?? emptyCell,
      className: 'max-w-56 truncate',
    },
  ]
}
