import { useLayoutEffect, useRef } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { LocaleControls } from '@fuel-carrier/web-ui/ui'
import {
  LANDING_CHROME_BG,
  LANDING_CHROME_TEXT,
  LANDING_GRID,
  LANDING_SCROLL_OFFSET,
} from './landingChrome'
import { LandingBrandButton } from './LandingBrandButton'
import { LandingNavLink } from './LandingNavLink'
import { LandingSignIn } from './LandingSignIn'
import { scrollToSection } from './scrollToSection'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const nav = [
  { id: 'fleet', labelKey: 'fleet' as const },
  { id: 'live', labelKey: 'live' as const },
  { id: 'control', labelKey: 'control' as const },
]

export function LandingHeader() {
  const { LL } = useI18nContext()
  const reduceMotion = usePrefersReducedMotion()
  const headerRef = useRef<HTMLElement>(null)
  const sectionsLabel = LL.externalPanel.landing.footer.exploreTitle()

  useLayoutEffect(function publishHeaderHeight() {
    const header = headerRef.current
    if (!header) return
    const bar: HTMLElement = header

    function publish() {
      document.documentElement.style.setProperty(
        '--landing-header',
        `${bar.offsetHeight}px`,
      )
    }

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(bar)
    return function cleanup() {
      observer.disconnect()
      document.documentElement.style.removeProperty('--landing-header')
    }
  }, [])

  function goToSection(id: string) {
    const header = headerRef.current
    scrollToSection({
      id,
      behavior: reduceMotion ? 'auto' : 'smooth',
      offset:
        header instanceof HTMLElement
          ? header.offsetHeight + 8
          : LANDING_SCROLL_OFFSET,
    })
  }

  function renderNav(item: (typeof nav)[number]) {
    return (
      <LandingNavLink
        key={item.id}
        label={LL.externalPanel.landing.header[item.labelKey]()}
        onClick={function onSectionClick() {
          goToSection(item.id)
        }}
      />
    )
  }

  return (
    <header
      ref={headerRef}
      data-landing-header
      className={`fixed inset-x-0 top-0 z-40 border-b border-base-content/10 ${LANDING_CHROME_BG} ${LANDING_CHROME_TEXT}`}
    >
      <div aria-hidden className={`overflow-hidden ${LANDING_GRID}`} />
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        <LandingBrandButton
          onClick={function goTop() {
            goToSection('top')
          }}
        >
          <img
            src="/inergy-logo.png"
            alt=""
            className="h-9 w-auto max-w-28 shrink-0 object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:h-10 sm:max-w-32"
          />
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary">
              {LL.externalPanel.landing.brand()}
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] opacity-50 transition-opacity duration-300 group-hover:opacity-70 sm:block">
              {LL.externalPanel.landing.brandSubtitle()}
            </span>
          </span>
        </LandingBrandButton>

        <nav
          aria-label={sectionsLabel}
          className="hidden items-center gap-0.5 md:flex"
        >
          {nav.map(renderNav)}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleControls className="relative top-auto end-auto" />
          <LandingSignIn
            label={LL.externalPanel.landing.header.signIn()}
            shortLabel={LL.externalPanel.landing.header.signInShort()}
            size="sm"
            proximity={96}
          />
        </div>
      </div>
      <nav
        aria-label={sectionsLabel}
        className="relative flex gap-1 overflow-x-auto px-4 pb-3 md:hidden"
      >
        {nav.map(renderNav)}
      </nav>
    </header>
  )
}
