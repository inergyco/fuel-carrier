import { Link } from '@tanstack/react-router'
import { Menu } from '@fuel-carrier/web-ui/icons'
import type { ReactNode } from 'react'
import { cn } from '../utils'
import { LocaleControls } from './LocaleControls'

export interface PanelNavItem {
  to: string
  label: string
  icon: ReactNode
  exact?: boolean
}

interface PanelShellProps {
  navItems: PanelNavItem[]
  brandTitle: string
  brandSubtitle?: string
  brandIcon?: ReactNode
  drawerId?: string
  openMenuLabel: string
  footer?: ReactNode
  background?: ReactNode
  children: ReactNode
}

const shellGridClassName =
  'pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(var(--bc)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--bc)/0.03)_1px,transparent_1px)] bg-[size:32px_32px]'

const shellHeaderClassName =
  'flex h-14 shrink-0 items-center gap-3 border-b border-base-content/8'

export function PanelShell({
  navItems,
  brandTitle,
  brandSubtitle,
  brandIcon,
  drawerId = 'panel-shell-drawer',
  openMenuLabel,
  footer,
  background,
  children,
}: PanelShellProps) {
  return (
    <div className="drawer lg:drawer-open">
      <input id={drawerId} type="checkbox" className="drawer-toggle" />

      <div
        className={cn(
          'drawer-content flex min-h-svh flex-col',
          background ? 'bg-transparent' : 'bg-base-100',
        )}
      >
        <header
          className={cn(
            shellHeaderClassName,
            'sticky top-0 z-20 bg-base-100/70 px-4 backdrop-blur-xl lg:px-6',
          )}
        >
          <label
            htmlFor={drawerId}
            aria-label={openMenuLabel}
            className="btn btn-ghost btn-sm btn-square h-10 min-h-10 w-10 lg:hidden"
          >
            <Menu className="size-6" strokeWidth={2.25} aria-hidden />
          </label>

          <div className="flex flex-1 items-center justify-end">
            <LocaleControls className="relative top-auto end-auto" />
          </div>
        </header>

        <div className="relative flex flex-1 overflow-hidden">
          {background ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {background}
            </div>
          ) : null}
          <div aria-hidden className={shellGridClassName} />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 end-0 h-72 w-72 rounded-full bg-primary/8 blur-3xl"
          />
          <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      <div className="drawer-side z-30">
        <label htmlFor={drawerId} aria-label={openMenuLabel} className="drawer-overlay" />
        <aside className="flex h-full w-72 flex-col border-base-content/8 bg-base-200/30 backdrop-blur-xl ltr:border-r rtl:border-l">
          <div aria-hidden className={shellGridClassName} />

          <div className={cn(shellHeaderClassName, 'relative px-5')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/15 text-primary [&_svg]:size-5">
              {brandIcon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">{brandTitle}</p>
              {brandSubtitle ? (
                <p className="truncate text-[10px] uppercase tracking-widest text-base-content/40">
                  {brandSubtitle}
                </p>
              ) : null}
            </div>
          </div>

          <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map(function renderNavItem(item) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact ?? false }}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                    'text-base-content/75 hover:bg-base-content/5 hover:text-base-content',
                  )}
                  activeProps={{
                    className:
                      'bg-primary/10 text-primary border border-primary/15 shadow-[0_0_24px_-8px] shadow-primary/30 [&_svg]:text-primary',
                  }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-base-content/12 bg-base-100/50 text-base-content/85 transition-colors group-hover:border-base-content/20 group-hover:text-base-content [&_svg]:size-5">
                    {item.icon}
                  </span>
                  <span className="truncate font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {footer ? (
            <div className="relative border-t border-base-content/8 p-3">{footer}</div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
