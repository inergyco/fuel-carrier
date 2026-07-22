import { useI18nContext } from "@fuel-carrier/i18n/react";
import {
  isCompanyUserAdmin,
  type AuthSession,
} from "@fuel-carrier/shared-types";
import { useQueryClient } from "@fuel-carrier/web-ui/query";
import {
  Button,
  ConfirmModal,
  ICON_STROKE_WIDTH,
  PanelShell,
  type PanelNavItem,
} from "@fuel-carrier/web-ui/ui";
import {
  Home,
  Users,
  Car,
  Truck,
  Map,
  ScrollText,
} from "@fuel-carrier/web-ui/icons";
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { authKeys, logout } from "../lib/api/auth";
import { redirectToLoginPage } from "../lib/redirect";
import { CompanyBrandLogo } from "./CompanyBrandLogo";
import { InergyFooter } from "./InergyFooter";

interface AuthenticatedShellProps {
  children: ReactNode;
  user: AuthSession;
}

export function AuthenticatedShell({
  children,
  user,
}: AuthenticatedShellProps) {
  const { LL } = useI18nContext();
  const queryClient = useQueryClient();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = useRouterState({
    select: function selectPathname(state) {
      return state.location.pathname;
    },
  });
  const isMapPage = pathname === "/map";

  const navItems = useMemo(
    function createNavItems(): PanelNavItem[] {
      return [
        {
          to: "/",
          label: LL.externalPanel.nav.dashboard(),
          icon: <Home strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
          exact: true,
        },
        {
          to: "/users",
          label: LL.externalPanel.nav.users(),
          icon: <Users strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        },
        {
          to: "/drivers",
          label: LL.externalPanel.nav.drivers(),
          icon: <Car strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        },
        {
          to: "/cars",
          label: LL.externalPanel.nav.cars(),
          icon: <Truck strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        },
        {
          to: "/map",
          label: LL.externalPanel.nav.map(),
          icon: <Map strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        },
        {
          to: "/audit-logs",
          label: LL.externalPanel.nav.auditLogs(),
          icon: <ScrollText strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        },
      ];
    },
    [LL],
  );

  function handleOpenLogoutModal() {
    setIsLogoutModalOpen(true);
  }

  function handleCloseLogoutModal() {
    if (!isLoggingOut) {
      setIsLogoutModalOpen(false);
    }
  }

  async function handleConfirmLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      queryClient.removeQueries({ queryKey: authKeys.me });
      setIsLogoutModalOpen(false);
      await redirectToLoginPage(location.href);
    } finally {
      setIsLoggingOut(false);
    }
  }

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const levelLabel = isCompanyUserAdmin(user)
    ? LL.common.companyUserLevel.admin()
    : LL.common.companyUserLevel.viewer();

  return (
    <>
      <PanelShell
        brandTitle={LL.externalPanel.shell.brand()}
        brandSubtitle={LL.externalPanel.shell.brandSubtitle()}
        brandIcon={<CompanyBrandLogo logoUrl={user.companyLogoUrl} />}
        openMenuLabel={LL.externalPanel.nav.openMenu()}
        navItems={navItems}
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
          <div className="space-y-3">
            <div className="rounded-xl border border-base-content/12 bg-base-100 p-3">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-gradient-to-br from-primary/15 to-secondary/10 text-xs font-semibold text-primary">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate font-mono text-[10px] text-base-content/40">
                    @{user.username}
                  </p>
                  <p className="truncate text-[10px] text-base-content/45">
                    {levelLabel}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-full justify-center border border-base-content/8 bg-base-100/30 normal-case tracking-normal"
                onClick={handleOpenLogoutModal}
              >
                {LL.externalPanel.nav.signOut()}
              </Button>
            </div>
            <InergyFooter stacked className="hidden lg:flex" />
          </div>
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
  );
}
