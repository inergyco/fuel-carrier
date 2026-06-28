import { Link } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { cn } from '@fuel-carrier/web-ui/utils'
import { ICON_STROKE_WIDTH, iconMdClassName } from '@fuel-carrier/web-ui/ui'
import { Building2, Car, ScrollText, Users, UserRound } from '@fuel-carrier/web-ui/icons'

interface CompanyResourceNavProps {
  companyId: string
}

const navLinkClassName =
  'flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-base-content/12 bg-base-100/40 px-3 py-2 text-sm font-medium transition-all text-base-content/75 hover:border-base-content/20 hover:bg-base-100/55 hover:text-base-content sm:px-4'

const activeNavLinkClassName =
  'border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_-8px] shadow-primary/30'

export function CompanyResourceNav({ companyId }: CompanyResourceNavProps) {
  const { LL } = useI18nContext()

  const items = [
    {
      to: '/companies/$companyId' as const,
      label: LL.internalPanel.companies.detail.overviewTitle(),
      icon: Building2,
      exact: true,
    },
    {
      to: '/companies/$companyId/users' as const,
      label: LL.internalPanel.companies.detail.usersTitle(),
      icon: Users,
      exact: false,
    },
    {
      to: '/companies/$companyId/drivers' as const,
      label: LL.internalPanel.companies.detail.driversTitle(),
      icon: UserRound,
      exact: false,
    },
    {
      to: '/companies/$companyId/cars' as const,
      label: LL.internalPanel.companies.detail.carsTitle(),
      icon: Car,
      exact: false,
    },
    {
      to: '/companies/$companyId/audit-logs' as const,
      label: LL.internalPanel.companies.detail.auditLogsTitle(),
      icon: ScrollText,
      exact: false,
    },
  ]

  return (
    <nav className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
      {items.map(function renderNavItem(item) {
        const Icon = item.icon

        return (
          <Link
            key={item.to}
            to={item.to}
            params={{ companyId }}
            activeOptions={{ exact: item.exact }}
            className={navLinkClassName}
            activeProps={{ className: cn(navLinkClassName, activeNavLinkClassName) }}
          >
            <Icon className={iconMdClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
