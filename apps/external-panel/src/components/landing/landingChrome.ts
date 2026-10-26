/** Fixed header clearance for in-page scroll (matches h-16 / sm:h-20). */
export const LANDING_SCROLL_OFFSET = 64

/** Shared chrome for landing header, bridges, and footer — follows light/dark theme. */
export const LANDING_CHROME_BG = 'bg-base-100'

export const LANDING_CHROME_BORDER =
  'border-base-content/10 [[data-theme=external-dark]_&]:border-white/10'

export const LANDING_CHROME_TEXT =
  'text-base-content [[data-theme=external-dark]_&]:text-white'

/** Square grid for header / bridges / footer — viewport-fixed so seams align. */
export const LANDING_GRID =
  'pointer-events-none absolute inset-0 bg-fixed opacity-50 [background-image:linear-gradient(color-mix(in_oklab,var(--color-primary)_9%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--color-primary)_9%,transparent)_1px,transparent_1px)] [background-size:48px_48px]'

/** Finer pattern for content cards. */
export const LANDING_CARD_PATTERN =
  'pointer-events-none absolute inset-0 opacity-[0.42] [background-image:linear-gradient(color-mix(in_oklab,var(--color-primary)_10%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--color-primary)_10%,transparent)_1px,transparent_1px),radial-gradient(color-mix(in_oklab,var(--color-primary)_14%,transparent)_0.55px,transparent_0.65px)] [background-size:28px_28px,28px_28px,14px_14px]'
