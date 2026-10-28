import { useId } from 'react'

/** Even rim glow with a highlight that travels the full perimeter. */
export function LandingCardShine({
  hidden = false,
  width,
  height,
}: {
  hidden?: boolean
  width: number
  height: number
}) {
  const uid = useId().replace(/:/g, '')
  const rimFilterId = `card-rim-fade-${uid}`
  const glowFilterId = `card-rim-glow-${uid}`
  const inset = 5
  const rw = Math.max(0, width - inset * 2)
  const rh = Math.max(0, height - inset * 2)
  const rim = 'color-mix(in oklab, var(--color-primary) 55%, transparent)'

  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-20 size-full transition-opacity duration-300 ${
        hidden ? 'opacity-0' : 'opacity-100'
      }`}
      width={width}
      height={height}
    >
      <defs>
        <filter
          id={glowFilterId}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" />
        </filter>
        <filter
          id={rimFilterId}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.45" />
        </filter>
      </defs>
      <rect
        x={inset}
        y={inset}
        width={rw}
        height={rh}
        rx={24}
        ry={24}
        fill="none"
        stroke={rim}
        strokeWidth="3"
        filter={`url(#${glowFilterId})`}
        opacity={0.28}
      />
      <rect
        x={inset}
        y={inset}
        width={rw}
        height={rh}
        rx={24}
        ry={24}
        fill="none"
        stroke={rim}
        strokeWidth="1.15"
        filter={`url(#${rimFilterId})`}
        opacity={0.48}
      />
      <rect
        x={inset}
        y={inset}
        width={rw}
        height={rh}
        rx={24}
        ry={24}
        fill="none"
        stroke="color-mix(in oklab, var(--color-primary) 65%, white)"
        strokeWidth="1.4"
        pathLength={100}
        strokeDasharray="16 84"
        strokeLinecap="round"
        opacity={0.38}
        className="motion-safe:animate-[landing-card-shine_9s_linear_infinite]"
      />
      <style>{`
        @keyframes landing-card-shine {
          to { stroke-dashoffset: -100; }
        }
      `}</style>
    </svg>
  )
}
