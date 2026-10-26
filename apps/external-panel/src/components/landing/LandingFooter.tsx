import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  LANDING_CHROME_BG,
  LANDING_CHROME_BORDER,
  LANDING_CHROME_TEXT,
  LANDING_GRID,
  LANDING_SCROLL_OFFSET,
} from './landingChrome'
import { scrollToSection } from './scrollToSection'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const explore = [
  { id: 'fleet', labelKey: 'exploreFleet' as const },
  { id: 'live', labelKey: 'exploreLive' as const },
  { id: 'control', labelKey: 'exploreControl' as const },
]

export function LandingFooter() {
  const { LL } = useI18nContext()
  const t = LL.externalPanel.landing.footer
  const year = new Date().getFullYear()
  const reduceMotion = usePrefersReducedMotion()
  const linkClass = 'text-sm opacity-60 transition-opacity hover:opacity-100'

  function goTo(id: string) {
    scrollToSection({
      id,
      behavior: reduceMotion ? 'auto' : 'smooth',
      offset: LANDING_SCROLL_OFFSET,
    })
  }

  return (
    <footer
      className={`relative z-[1] overflow-hidden border-t shadow-[0_-12px_40px_-20px_rgba(0,0,0,0.18)] [[data-theme=external-dark]_&]:shadow-[0_-16px_48px_-18px_rgba(0,0,0,0.55)] ${LANDING_CHROME_BG} ${LANDING_CHROME_BORDER} ${LANDING_CHROME_TEXT}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -start-28 top-0 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div aria-hidden className={LANDING_GRID} />

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-5">
            <a
              href="https://www.inergy.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
            >
              <img
                src="/inergy-logo.png"
                alt="Inergy"
                className="h-11 w-auto max-w-48 object-contain"
              />
            </a>
            <p className="mt-5 max-w-sm text-lg font-semibold tracking-tight">
              {t.tagline()}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed opacity-55">
              {t.note()}
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {t.exploreTitle()}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {explore.map(function renderExplore(item) {
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={linkClass}
                      onClick={function onExplore() {
                        goTo(item.id)
                      }}
                    >
                      {t[item.labelKey]()}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {t.portalTitle()}
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-sm opacity-60">
              <li>{t.portalAccess()}</li>
              <li>{t.portalSecure()}</li>
              <li>{t.portalSupport()}</li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {t.companyTitle()}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              <li className="text-sm opacity-60">{t.companyProduct()}</li>
              <li>
                <a
                  href="https://www.inergy.ir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {t.companyAbout()}
                </a>
              </li>
              <li>
                <a
                  href="https://www.inergy.ir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {t.companySite()}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-base-content/10 pt-6 [[data-theme=external-dark]_&]:border-white/10">
          <p className="text-xs opacity-40">
            {LL.externalPanel.footer.copyright({ year })}
          </p>
        </div>
      </div>
    </footer>
  )
}
