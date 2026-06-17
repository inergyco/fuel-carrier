import { useNavigate } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { getRouteApi } from '@tanstack/react-router'
import { useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  Button,
  ConfirmModal,
  PanelShell,
  type PanelNavItem,
} from '@fuel-carrier/web-ui/ui'
import { Home, Zap } from '@fuel-carrier/web-ui/icons'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { authKeys, logout } from '../lib/auth'
import { sanitizeRedirectPath } from '../lib/redirect'

const authenticatedRoute = getRouteApi('/_authenticated')

interface AuthenticatedShellProps {
  children: ReactNode
}

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  const { user } = authenticatedRoute.useRouteContext()
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navItems = useMemo(function createNavItems(): PanelNavItem[] {
    return [
      {
        to: '/',
        label: LL.internalPanel.nav.dashboard(),
        icon: <Home className="h-4 w-4" aria-hidden />,
        exact: true,
      },
    ]
  }, [LL])

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
      setIsLogoutModalOpen(false)
      await navigate({
        to: '/login',
        search: { redirect: sanitizeRedirectPath(location.href) },
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <>
      <PanelShell
        brandTitle={LL.internalPanel.shell.brand()}
        brandSubtitle={LL.internalPanel.shell.brandSubtitle()}
        brandIcon={<Zap className="h-4 w-4" aria-hidden />}
        openMenuLabel={LL.internalPanel.nav.openMenu()}
        navItems={navItems}
        footer={
          <div className="rounded-xl border border-base-content/8 bg-base-100/40 p-3 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate font-mono text-[10px] text-base-content/40">
                  @{user.username}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full justify-center border border-base-content/8 bg-base-100/30 normal-case tracking-normal"
              onClick={handleOpenLogoutModal}
            >
              {LL.internalPanel.nav.signOut()}
            </Button>
          </div>
        }
      >
        {children}
      </PanelShell>

      <ConfirmModal
        open={isLogoutModalOpen}
        title={LL.internalPanel.nav.signOutConfirmTitle()}
        description={LL.internalPanel.nav.signOutConfirmDescription()}
        confirmLabel={LL.internalPanel.nav.signOutConfirm()}
        cancelLabel={LL.internalPanel.nav.cancel()}
        loading={isLoggingOut}
        loadingLabel={LL.internalPanel.nav.signingOut()}
        onConfirm={handleConfirmLogout}
        onCancel={handleCloseLogoutModal}
      />
    </>
  )
}
