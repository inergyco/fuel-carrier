import type { ReactNode } from 'react'
import { LocaleControls } from '@fuel-carrier/web-ui/ui'
import { ExternalPanelBackground } from './ExternalPanelBackground'

interface AuthPageShellProps {
  icon: ReactNode
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthPageShell({
  icon,
  title,
  subtitle,
  children,
}: AuthPageShellProps) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-base-100 p-4 sm:p-6">
      <LocaleControls />

      <ExternalPanelBackground />

      {/* Aurora mesh */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 start-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute -bottom-1/4 end-1/4 h-80 w-80 rounded-full bg-secondary/12 blur-[90px]" />
        <div className="absolute top-1/2 start-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[80px]" />
      </div>

      {/* Hex grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0iTTI0IDBoMjRsMTIgMjF2MjFMMjQgNDJMMTIgMjFWMjB6IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLW9wYWNpdHk9IjAuMDQiLz48L3N2Zz4=')] bg-[size:48px_48px]"
      />

      {/* Scan line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 inline-flex">
            <div
              aria-hidden
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 blur-md"
            />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-base-200/70 backdrop-blur-xl">
              {icon}
            </div>
          </div>
          <h1 className="bg-gradient-to-br from-base-content via-base-content to-base-content/60 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            {title}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-base-content/45">
            {subtitle}
          </p>
        </div>

        <div className="relative rounded-2xl p-px bg-gradient-to-br from-primary/30 via-secondary/15 to-accent/25 shadow-2xl shadow-primary/5">
          <div className="rounded-2xl border border-base-content/5 bg-base-200/60 p-6 backdrop-blur-2xl sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
