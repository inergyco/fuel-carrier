import { Link } from "@tanstack/react-router";
import { Menu } from "@fuel-carrier/web-ui/icons";
import type { ReactNode } from "react";
import { cn } from "../utils";
import { IconButton } from "./IconButton";
import { PageHeader } from "./PageHeader";

export interface PanelNavItem {
  to: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

interface PanelShellProps {
  navItems: PanelNavItem[];
  brandTitle: string;
  brandSubtitle?: string;
  brandIcon?: ReactNode;
  drawerId?: string;
  openMenuLabel: string;
  /** Page title shown in the top app bar (start side). */
  appBarTitle?: string;
  /** Optional subtitle under the app bar title (e.g. welcome line). */
  appBarSubtitle?: string;
  /** Leading control in the app bar, such as a back button. */
  appBarBack?: ReactNode;
  /** Trailing controls before locale toggles (e.g. company switcher). */
  appBarActions?: ReactNode;
  footer?: ReactNode;
  pageFooter?: ReactNode;
  background?: ReactNode;
  /** Extra classes for the scrollable main content region. */
  mainClassName?: string;
  /** Skip Tailwind `container` and padding (full-bleed pages like the map). */
  fullWidthMain?: boolean;
  children: ReactNode;
}

const shellGridClassName =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(var(--bc)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--bc)/0.03)_1px,transparent_1px)] bg-[size:32px_32px]";

const sidebarHeaderClassName =
  "relative flex min-h-16 shrink-0 items-center gap-3.5 px-5 py-3";

export function PanelShell({
  navItems,
  brandTitle,
  brandSubtitle,
  brandIcon,
  drawerId = "panel-shell-drawer",
  openMenuLabel,
  appBarTitle,
  appBarSubtitle,
  appBarBack,
  appBarActions,
  footer,
  pageFooter,
  background,
  mainClassName,
  fullWidthMain = false,
  children,
}: PanelShellProps) {
  return (
    <div className="drawer lg:drawer-open">
      <input id={drawerId} type="checkbox" className="drawer-toggle" />

      <div
        className={cn(
          "drawer-content flex min-h-svh flex-col",
          background ? "bg-transparent" : "bg-base-100",
        )}
      >
        <header
          className={cn(
            "sticky top-0 z-20 flex shrink-0 items-center gap-x-3 gap-y-2 border-b border-base-content/8 bg-base-100/70 px-4 backdrop-blur-xl lg:px-6",
            appBarActions && "flex-wrap",
            appBarSubtitle || appBarActions ? "min-h-14 py-2" : "h-14",
          )}
        >
          <IconButton
            as="label"
            htmlFor={drawerId}
            aria-label={openMenuLabel}
            className={cn("lg:hidden", appBarBack && "hidden")}
          >
            <Menu className="size-6" strokeWidth={2.25} aria-hidden />
          </IconButton>

          {appBarBack}

          {appBarTitle || appBarSubtitle ? (
            <PageHeader
              className="min-w-0 flex-1"
              title={appBarTitle}
              subtitle={appBarSubtitle}
            />
          ) : (
            <div className="flex-1" />
          )}

          {appBarActions ? (
            <div className="flex w-full min-w-0 basis-full items-center justify-end sm:ms-auto sm:w-auto sm:max-w-[min(36rem,calc(100%-11rem))] sm:basis-auto sm:flex-1 lg:max-w-none lg:flex-none">
              {appBarActions}
            </div>
          ) : null}
        </header>

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
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
          <main
            className={cn(
              "relative z-10 min-h-0 flex-1",
              fullWidthMain
                ? "flex flex-col overflow-hidden"
                : "container mx-auto flex w-full flex-col overflow-y-auto p-4 md:p-6 lg:p-8",
              mainClassName,
            )}
          >
            {children}
          </main>
        </div>

        {pageFooter}
      </div>

      <div className="drawer-side z-30">
        <label
          htmlFor={drawerId}
          aria-label={openMenuLabel}
          className="drawer-overlay"
        />
        <aside
          className={cn(
            "flex h-full w-72 flex-col ltr:border-r rtl:border-l",
            // Themes may set --panel-sidebar (e.g. external navy). Fallback = base-200.
            "border-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-base-content))_12%,transparent)]",
            "bg-[var(--panel-sidebar,var(--color-base-200))]",
            "text-[var(--panel-sidebar-content,var(--color-base-content))]",
          )}
        >
          <div aria-hidden className={shellGridClassName} />

          <div className={sidebarHeaderClassName}>
            <div className="flex h-12 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-primary))_25%,transparent)] bg-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-primary))_12%,transparent)] px-2 text-[var(--panel-sidebar-content,var(--color-primary))] [&_img]:h-10 [&_img]:w-auto [&_img]:max-w-[7rem] [&_img]:object-contain [&_svg]:size-7">
              {brandIcon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight md:text-lg">
                {brandTitle}
              </p>
              {brandSubtitle ? (
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-base-content))_55%,transparent)] md:text-sm">
                  {brandSubtitle}
                </p>
              ) : null}
            </div>
          </div>

          <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map(function renderNavItem(item) {
              function handleNavClick() {
                const toggle = document.getElementById(
                  drawerId,
                ) as HTMLInputElement | null;
                if (toggle?.checked) {
                  toggle.checked = false;
                }
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact ?? false }}
                  onClick={handleNavClick}
                  className={cn(
                    "group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                    "text-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-base-content))_75%,transparent)]",
                    "hover:bg-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-base-content))_8%,transparent)]",
                    "hover:text-[var(--panel-sidebar-content,var(--color-base-content))]",
                  )}
                  activeProps={{
                    className: cn(
                      "border shadow-[0_0_24px_-8px]",
                      // On brand navy sidebars, highlight with light glass; otherwise primary tint.
                      "[--active-fg:var(--panel-sidebar-content,var(--color-primary))]",
                      "bg-[color-mix(in_oklab,var(--active-fg)_14%,transparent)]",
                      "text-[var(--active-fg)]",
                      "border-[color-mix(in_oklab,var(--active-fg)_20%,transparent)]",
                      "shadow-[color-mix(in_oklab,var(--active-fg)_30%,transparent)]",
                      "[&_svg]:text-[var(--active-fg)]",
                    ),
                  }}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors [&_svg]:size-5",
                      "border-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-base-content))_14%,transparent)]",
                      "bg-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-base-100))_10%,transparent)]",
                      "text-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-base-content))_85%,transparent)]",
                      "group-hover:border-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-base-content))_22%,transparent)]",
                      "group-hover:text-[var(--panel-sidebar-content,var(--color-base-content))]",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {footer ? (
            <div
              className={cn(
                "relative border-t p-3",
                "border-[color-mix(in_oklab,var(--panel-sidebar-content,var(--color-base-content))_12%,transparent)]",
                "bg-[var(--panel-sidebar,var(--color-base-200))]",
              )}
            >
              {footer}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
