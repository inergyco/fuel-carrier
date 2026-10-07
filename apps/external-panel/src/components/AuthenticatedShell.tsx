import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { AuthSession } from '@fuel-carrier/shared-types'
import { broadcastAuthLogout } from '@fuel-carrier/web-ui/auth'
import { DashboardModeSwitcher } from '@fuel-carrier/web-ui/dashboard'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  CompanyBrandLogo,
  ConfirmModal,
  PanelShell,
} from '@fuel-carrier/web-ui/ui'
import { redirectToLoginPage } from '@fuel-carrier/web-ui/utils'
import { useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { authKeys, logout } from '../lib/api/auth'
import { InergyFooter } from './InergyFooter'
import { AppBarBackLink } from './shell/AppBarBackLink'
import { ShellSidebarFooter } from './shell/ShellSidebarFooter'
import { useAppBarHeading } from './shell/useAppBarHeading'
import { useExternalNavItems } from './shell/useExternalNavItems'

interface AuthenticatedShellProps {
  children: ReactNode
  user: AuthSession
}

export function AuthenticatedShell({
  children,
  user,
}: AuthenticatedShellProps) {
  const { LL } = useI18nContext()
  const queryClient = useQueryClient()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = useRouterState({
    select: function selectPathname(state) {
      return state.location.pathname
    },
  })
  const isMapPage = pathname === '/map'
  const heading = useAppBarHeading(pathname, user.firstName)
  const navItems = useExternalNavItems(user)

  function handleOpenLogoutModal() {
    setIsLogoutModalOpen(true)
  }

  function handleCloseLogoutModal() {
    if (!isLoggingOut) {
      setIsLogoutModalOpen(false)
    }
  }

  async function handleConfirmLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
      queryClient.removeQueries({ queryKey: authKeys.me })
      broadcastAuthLogout('external')
      setIsLogoutModalOpen(false)
      redirectToLoginPage(location.href)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <PanelShell
        brandTitle={LL.externalPanel.shell.brand()}
        brandSubtitle={LL.externalPanel.shell.brandSubtitle()}
        brandIcon={<CompanyBrandLogo logoUrl={user.companyLogoUrl} />}
        openMenuLabel={LL.externalPanel.nav.openMenu()}
        navItems={navItems}
        appBarTitle={heading?.title}
        appBarSubtitle={heading?.subtitle}
        appBarBack={
          heading?.backTo && heading.backLabel ? (
            <AppBarBackLink to={heading.backTo} label={heading.backLabel} />
          ) : null
        }
        appBarActions={
          pathname === '/' || pathname === '/map' ? (
            <DashboardModeSwitcher />
          ) : null
        }
        fullWidthMain={isMapPage}
        pageFooter={
          isMapPage ? undefined : (
            <InergyFooter
              stacked
              className="relative z-10 shrink-0 lg:hidden"
            />
          )
        }
        footer={
          <ShellSidebarFooter user={user} onSignOut={handleOpenLogoutModal} />
        }
      >
        {children}
      </PanelShell>

      <ConfirmModal
        open={isLogoutModalOpen}
        title={LL.externalPanel.nav.signOutConfirmTitle()}
        description={LL.externalPanel.nav.signOutConfirmDescription()}
        confirmLabel={LL.externalPanel.nav.signOutConfirm()}
        cancelLabel={LL.externalPanel.nav.cancel()}
        loading={isLoggingOut}
        loadingLabel={LL.externalPanel.nav.signingOut()}
        onConfirm={handleConfirmLogout}
        onCancel={handleCloseLogoutModal}
      />
    </>
  )
}
