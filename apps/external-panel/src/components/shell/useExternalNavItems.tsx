import { useI18nContext } from "@fuel-carrier/i18n/react";
import {
  isCompanyUserAdmin,
  type AuthSession,
} from "@fuel-carrier/shared-types";
import {
  Car,
  Home,
  ScrollText,
  Settings,
  Truck,
  Users,
} from "@fuel-carrier/web-ui/icons";
import { ICON_STROKE_WIDTH, type PanelNavItem } from "@fuel-carrier/web-ui/ui";
import { useMemo } from "react";

export function useExternalNavItems(user: AuthSession): PanelNavItem[] {
  const { LL } = useI18nContext();

  return useMemo(
    function createNavItems() {
      const items: PanelNavItem[] = [
        {
          to: "/panel",
          label: LL.externalPanel.nav.dashboard(),
          icon: <Home strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
          exact: true,
        },
      ];

      if (isCompanyUserAdmin(user)) {
        items.push({
          to: "/panel/users",
          label: LL.externalPanel.nav.users(),
          icon: <Users strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        });
      }

      items.push(
        {
          to: "/panel/drivers",
          label: LL.externalPanel.nav.drivers(),
          icon: <Truck strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        },
        {
          to: "/panel/cars",
          label: LL.externalPanel.nav.cars(),
          icon: <Car strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        },
        // {
        //   to: '/panel/map',
        //   label: LL.externalPanel.nav.map(),
        //   icon: <Map strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        // },
      );

      if (isCompanyUserAdmin(user)) {
        items.push({
          to: "/panel/audit-logs",
          label: LL.externalPanel.nav.auditLogs(),
          icon: <ScrollText strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
        });
      }

      items.push({
        to: "/panel/settings",
        label: LL.externalPanel.nav.settings(),
        icon: <Settings strokeWidth={ICON_STROKE_WIDTH} aria-hidden />,
      });

      return items;
    },
    [LL, user],
  );
}
