import { cn } from '@fuel-carrier/web-ui/utils'

type LandingImageEdgeFadeProps = {
  edge: 'top' | 'bottom'
  className?: string
}

/**
 * Soft melt from stage photos into neighboring chrome.
 * Long, low-opacity falloff — avoids a hard horizontal band.
 */
export function LandingImageEdgeFade({
  edge,
  className,
}: LandingImageEdgeFadeProps) {
  const isTop = edge === 'top'

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0',
        isTop ? 'top-0 h-40 sm:h-48' : 'bottom-0 h-36 sm:h-44',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-0',
          isTop
            ? 'bg-gradient-to-b from-base-100 from-0% via-base-100/40 via-35% to-transparent to-100%'
            : 'bg-gradient-to-t from-base-100 from-0% via-base-100/35 via-35% to-transparent to-100%',
        )}
      />

      {/* Light only — blurred wash so the seam isn’t a ruler line */}
      <div
        className={cn(
          'absolute inset-x-0 blur-2xl [[data-theme=external-dark]_&]:hidden',
          isTop
            ? 'top-[-10%] h-[85%] bg-gradient-to-b from-base-100/70 via-base-100/25 to-transparent'
            : 'bottom-[-10%] h-[85%] bg-gradient-to-t from-base-100/70 via-base-100/25 to-transparent',
        )}
      />
    </div>
  )
}
