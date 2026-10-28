import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { AuthSession } from '@fuel-carrier/shared-types'
import { broadcastAuthLogout } from '@fuel-carrier/web-ui/auth'
import {
  DashboardModeProvider,
  DashboardModeSwitcher,
} from '@fuel-carrier/web-ui/dashboard'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  CompanyBrandLogo,
  ConfirmModal,
  LicensePlate,
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
import {
  useAppBarHeading,
  type AppBarHeading,
} from './shell/useAppBarHeading'
import { removeBrowserPushSubscription } from './notifications/browser-push-client'
import { NotificationBell } from './notifications/NotificationBell'
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
  const isMapPage = pathname === '/panel/map'
  const heading = useAppBarHeading(pathname, user.firstName)
  const navItems = useExternalNavItems(user)

  function renderAppBarTitle(current: AppBarHeading) {
    if (current.licensePlate && current.showTitleWithPlate) {
      return (
        <span className="inline-flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="truncate">{current.title}</span>
          <LicensePlate
            value={current.licensePlate}
            size="md"
            className="shrink-0"
          />
        </span>
      )
    }

    if (current.licensePlate) {
      return <LicensePlate value={current.licensePlate} size="md" />
    }

    return current.title
  }

  function renderAppBarBack(current: AppBarHeading) {
    if (!current.backTo || !current.backLabel) {
      return null
    }

    if (current.backTo === '/panel/cars/$carId') {
      if (!current.backCarId) {
        return null
      }

      return (
        <AppBarBackLink
          to="/panel/cars/$carId"
          carId={current.backCarId}
          label={current.backLabel}
        />
      )
    }

    return <AppBarBackLink to="/panel/cars" label={current.backLabel} />
  }

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
      try {
        await removeBrowserPushSubscription()
      } catch {
        // Signing out still continues when this browser has no push subscription.
      }
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
      <DashboardModeProvider panelId="external">
      <PanelShell
        brandTitle={LL.externalPanel.shell.brand()}
        brandSubtitle={LL.externalPanel.shell.brandSubtitle()}
        brandIcon={<CompanyBrandLogo logoUrl={user.companyLogoUrl} />}
        openMenuLabel={LL.externalPanel.nav.openMenu()}
        navItems={navItems}
        appBarTitle={heading ? renderAppBarTitle(heading) : undefined}
        appBarSubtitle={heading?.subtitle}
        appBarBack={heading ? renderAppBarBack(heading) : null}
        appBarActions={
          pathname === '/panel' || pathname === '/panel/map' ? (
            <DashboardModeSwitcher />
          ) : null
        }
        appBarInlineActions={<NotificationBell />}
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
      </DashboardModeProvider>
    </>
  )
}
