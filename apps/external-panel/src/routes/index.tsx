import { createFileRoute, Link } from '@tanstack/react-router'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { LocaleControls, buttonClassName } from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { InergyFooter } from '../components/InergyFooter'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { LL } = useI18nContext()

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-base-100">
      <LocaleControls />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 start-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute -bottom-1/4 end-1/4 h-80 w-80 rounded-full bg-secondary/12 blur-[90px]" />
        <div className="absolute top-1/2 start-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[80px]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0iTTI0IDBoMjRsMTIgMjF2MjFMMjQgNDJMMTIgMjFWMjB6IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLW9wYWNpdHk9IjAuMDQiLz48L3N2Zz4=')] bg-[size:48px_48px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-lg text-center">
          <a
            href="https://www.inergy.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mb-6 inline-flex rounded-lg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
          >
            <img
              src="/inergy-logo.png"
              alt="Inergy"
              className="h-11 w-auto max-w-48 object-contain sm:h-12"
            />
          </a>

          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">
            {LL.externalPanel.landing.brandSubtitle()}
          </p>
          <h1 className="mt-2 bg-gradient-to-br from-base-content via-base-content to-base-content/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {LL.externalPanel.landing.brand()}
          </h1>
          <p className="mt-4 text-lg font-medium tracking-tight text-base-content/80 sm:text-xl">
            {LL.externalPanel.landing.headline()}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-base-content/45">
            {LL.externalPanel.landing.description()}
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:mx-auto sm:max-w-xs">
            <Link
              to="/login"
              className={cn(
                buttonClassName.primary,
                'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70',
              )}
            >
              {LL.externalPanel.landing.signIn()}
            </Link>
            <Link to="/panel" className={buttonClassName.outline}>
              {LL.externalPanel.landing.openPanel()}
            </Link>
          </div>
        </div>
      </div>

      <InergyFooter className="relative z-10 shrink-0" />
    </main>
  )
}
