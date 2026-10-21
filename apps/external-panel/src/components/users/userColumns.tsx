import type { CompanyUser } from '@fuel-carrier/shared-types'
import { CompanyUserLevels } from '@fuel-carrier/shared-types'
import type { TranslationFunctions } from '@fuel-carrier/i18n'
import { Avatar } from '@fuel-carrier/web-ui/ui'
import type { ResourceColumn } from './ResourceSection'

interface UserColumnOptions {
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
}: UserColumnOptions): ResourceColumn<CompanyUser>[] {
  return [
    {
      key: 'name',
      header: LL.externalPanel.users.name(),
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
      key: 'level',
      header: LL.common.companyUserLevel.label(),
      cell: function renderLevel(user) {
        return formatLevel(user.level, LL)
      },
    },
    {
      key: 'username',
      header: LL.externalPanel.users.username(),
      cell: function renderUsername(user) {
        return user.username
      },
      className: 'font-mono text-sm',
    },
    {
      key: 'nationalId',
      header: LL.externalPanel.users.nationalId(),
      cell: function renderNationalId(user) {
        return user.nationalId ?? emptyCell
      },
    },
    {
      key: 'email',
      header: LL.externalPanel.users.email(),
      cell: function renderEmail(user) {
        return user.email ?? emptyCell
      },
    },
  ]
}
