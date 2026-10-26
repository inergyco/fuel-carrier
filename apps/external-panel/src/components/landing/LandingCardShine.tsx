import { useId } from 'react'

/** Soft-blurred rim that fades into the photo — no distortion. */
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
  const glowId = `card-rim-glow-${uid}`
  const inset = 4
  const rw = Math.max(0, width - inset * 2)
  const rh = Math.max(0, height - inset * 2)

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
          id={rimFilterId}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" />
        </filter>
        <linearGradient id={glowId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop
            offset="50%"
            stopColor="color-mix(in oklab, var(--color-primary) 28%, transparent)"
          />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <rect
        x={inset}
        y={inset}
        width={rw}
        height={rh}
        rx={26}
        ry={26}
        fill="none"
        stroke="color-mix(in oklab, var(--color-primary) 12%, transparent)"
        strokeWidth="3"
        filter={`url(#${rimFilterId})`}
        opacity={0.7}
      />
      <rect
        x={inset}
        y={inset}
        width={rw}
        height={rh}
        rx={26}
        ry={26}
        fill="none"
        stroke={`url(#${glowId})`}
        strokeWidth="2.5"
        pathLength={100}
        strokeDasharray="16 84"
        strokeLinecap="round"
        filter={`url(#${rimFilterId})`}
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
