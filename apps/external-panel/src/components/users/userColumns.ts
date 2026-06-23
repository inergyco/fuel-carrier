import type { CompanyUser } from '@fuel-carrier/shared-types'
import type { TranslationFunctions } from '@fuel-carrier/i18n'
import type { ResourceColumn } from './ResourceSection'

interface UserColumnOptions {
  LL: TranslationFunctions
  emptyCell?: string
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
        return `${user.firstName} ${user.lastName}`
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
