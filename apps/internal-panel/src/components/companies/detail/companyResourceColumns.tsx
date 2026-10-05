import type { Car, CompanyUser, Driver } from '@fuel-carrier/shared-types'
import { CompanyUserLevels } from '@fuel-carrier/shared-types'
import type { TranslationFunctions } from '@fuel-carrier/i18n'
import type { ResourceColumn } from './ResourceSection'

interface CompanyResourceColumnOptions {
  LL: TranslationFunctions
  emptyCell?: string
}

function formatLevel(
  level: CompanyUser['level'],
  LL: TranslationFunctions,
): string {
  return level === CompanyUserLevels.ADMIN
    ? LL.common.companyUserLevel.admin()
    : LL.common.companyUserLevel.viewer()
}

function formatCarLabel(car: Car): string {
  return car.name ? `${car.name} (${car.licensePlate})` : car.licensePlate
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
      key: 'level',
      header: LL.common.companyUserLevel.label(),
      cell: (user) => formatLevel(user.level, LL),
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
      cell: function renderFirstName(driver) {
        return (
          <span className="inline-flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-content/10 bg-base-100/60">
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
            <span>{driver.firstName}</span>
          </span>
        )
      },
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
    {
      key: 'mobileNumber',
      header: LL.internalPanel.companies.detail.mobileNumber(),
      cell: (driver) => driver.mobileNumber,
      className: 'font-mono text-sm',
    },
    {
      key: 'car',
      header: LL.internalPanel.companies.detail.car(),
      cell: (driver) =>
        driver.car
          ? formatCarLabel(driver.car)
          : LL.internalPanel.companies.detail.noCar(),
    },
  ]
}

export function getCarColumns({
  LL,
  emptyCell,
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
        car.driver
          ? `${car.driver.firstName} ${car.driver.lastName}`
          : LL.internalPanel.companies.detail.noDriver(),
    },
    {
      key: 'fuelType',
      header: LL.internalPanel.companies.detail.fuelType(),
      cell: (car) =>
        car.hasHighGrade
          ? LL.internalPanel.companies.detail.fuelTypeHighGrade()
          : LL.internalPanel.companies.detail.fuelTypeNormal(),
    },
    {
      key: 'note',
      header: LL.internalPanel.companies.note(),
      cell: (car) => car.note ?? emptyCell,
      className: 'max-w-56 truncate',
    },
  ]
}
