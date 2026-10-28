import { useId } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** Drawn route sitting in the glass card. The photograph stays the stage. */
export function LandingLiveScene() {
  const { LL } = useI18nContext()
  const t = LL.externalPanel.landing
  const reduceMotion = usePrefersReducedMotion()
  const uid = useId().replace(/:/g, '')
  const routeId = `route-${uid}`
  const stops = [
    t.flow.depot(),
    LL.externalPanel.home.statusMoving(),
    t.flow.delivery(),
  ]

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
        {t.routeCaption()}
      </p>
      <svg
        aria-hidden
        viewBox="0 0 760 220"
        className="mt-3 h-auto max-h-36 w-full"
        fill="none"
      >
        <circle cx="64" cy="160" r="7" fill="currentColor" className="text-primary" />
        <circle cx="690" cy="70" r="7" className="text-warning" fill="currentColor" />
        <path
          id={routeId}
          d="M64 160 C 160 160, 190 60, 300 68 S 450 180, 540 110 S 640 48, 690 70"
          stroke="currentColor"
          className="landing-route-dash text-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="8 12"
        />
        {reduceMotion ? (
          <circle cx="540" cy="110" r="6" fill="currentColor" className="text-base-content" />
        ) : (
          <circle r="6" fill="currentColor" className="text-base-content">
            <animateMotion dur="9s" repeatCount="indefinite" rotate="auto">
              <mpath href={`#${routeId}`} />
            </animateMotion>
          </circle>
        )}
      </svg>
      <ol className="mt-3 grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
        {stops.map(function renderStop(label, index) {
          return (
            <li
              key={label}
              className="rounded-lg border border-base-content/10 bg-base-content/5 px-2 py-2"
            >
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                0{index + 1}
              </span>
              {label}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
