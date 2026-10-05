import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  isCompanyUserAdmin,
  type AuthSession,
} from '@fuel-carrier/shared-types'
import { Button } from '@fuel-carrier/web-ui/ui'
import { InergyFooter } from '../InergyFooter'

interface ShellSidebarFooterProps {
  user: AuthSession
  onSignOut: () => void
}

export function ShellSidebarFooter({
  user,
  onSignOut,
}: ShellSidebarFooterProps) {
  const { LL } = useI18nContext()
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  const levelLabel = isCompanyUserAdmin(user)
    ? LL.common.companyUserLevel.admin()
    : LL.common.companyUserLevel.viewer()

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/12 bg-white/5 p-3 text-white">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate font-mono text-[10px] text-white/45">
              @{user.username}
            </p>
            <p className="truncate text-[10px] text-white/50">{levelLabel}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-full justify-center border border-white/12 bg-white/5 text-white normal-case tracking-normal hover:bg-white/10"
          onClick={onSignOut}
        >
          {LL.externalPanel.nav.signOut()}
        </Button>
      </div>
      <InergyFooter
        stacked
        className="hidden text-white/40 lg:flex [&_p]:text-white/40"
      />
    </div>
  )
}
