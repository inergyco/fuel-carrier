import type { CompanyUser, Driver } from '@fuel-carrier/shared-types'
import { CompanyUserLevels } from '@fuel-carrier/shared-types'
import type { TranslationFunctions } from '@fuel-carrier/i18n'
import { Avatar, LicensePlate } from '@fuel-carrier/web-ui/ui'
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

export function getUserColumns({
  LL,
  emptyCell,
}: CompanyResourceColumnOptions): ResourceColumn<CompanyUser>[] {
  return [
    {
      key: 'name',
      header: LL.internalPanel.companies.name(),
      cell: function renderName(user) {
        return (
          <span className="inline-flex items-center gap-2.5">
            <Avatar src={user.imageUrl} fallback={user.firstName.charAt(0)} />
            <span>
              {user.firstName} {user.lastName}
            </span>
          </span>
        )
      },
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
            <Avatar src={driver.imageUrl} fallback={driver.firstName.charAt(0)} />
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
      cell: function renderCar(driver) {
        if (!driver.car) {
          return LL.internalPanel.companies.detail.noCar()
        }

        return <LicensePlate value={driver.car.licensePlate} size="sm" />
      },
    },
  ]
}

