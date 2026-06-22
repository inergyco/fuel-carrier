/** Tailwind default breakpoint widths (px). */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const MEDIA_QUERIES = {
  smUp: `(min-width: ${BREAKPOINTS.sm}px)`,
  mdUp: `(min-width: ${BREAKPOINTS.md}px)`,
  lgUp: `(min-width: ${BREAKPOINTS.lg}px)`,
  xlUp: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xlUp': `(min-width: ${BREAKPOINTS['2xl']}px)`,
} as const
