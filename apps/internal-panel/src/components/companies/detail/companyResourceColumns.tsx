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
  return car.licensePlate
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
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-content/10 bg-base-100/60">
              {driver.imageUrl ? (
                <img
                  src={driver.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-md font-medium text-base-content/40">
                  {driver.firstName.charAt(0)}
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

