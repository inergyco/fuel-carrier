import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { cn } from '@fuel-carrier/web-ui/utils'
import { LandingCardShine } from './LandingCardShine'
import { LANDING_CARD_PATTERN } from './landingChrome'
import { useCardMotion } from './useCardMotion'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type LandingCardProps = {
  align?: 'start' | 'end' | 'center'
  wide?: boolean
  className?: string
  /** Replaces the default glass fill when the card sits on a flat field. */
  surfaceClassName?: string
  children: ReactNode
}

type CardSize = { w: number; h: number }

const CONTROL_SELECTOR =
  'button, a, [role="button"], input, select, textarea'
const HOLE_RADIUS = 68
const CONTROL_PAD = 48
/** How quickly the hole eases open / closed (per frame at 60fps). */
const HOLE_FADE = 0.08

function isNearControl(
  root: HTMLElement,
  clientX: number,
  clientY: number,
  padding: number,
) {
  const controls = root.querySelectorAll<HTMLElement>(CONTROL_SELECTOR)
  for (const control of controls) {
    const rect = control.getBoundingClientRect()
    const dx = Math.max(rect.left - clientX, 0, clientX - rect.right)
    const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom)
    if (Math.hypot(dx, dy) <= padding) return true
  }
  return false
}

export function LandingCard({
  align = 'start',
  wide = false,
  className,
  surfaceClassName,
  children,
}: LandingCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const holeCircleRef = useRef<SVGCircleElement>(null)
  const ripplesRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()
  const motionOk = !reduceMotion
  useCardMotion({ rootRef, enabled: motionOk })
  const uid = useId().replace(/:/g, '')
  const edgeFilterId = `card-edge-fade-${uid}`
  const holeFadeId = `hole-fade-${uid}`
  const holeBlurId = `hole-blur-${uid}`
  const holeMaskId = `hole-mask-${uid}`
  const silhouetteId = `card-silhouette-${uid}`
  const [size, setSize] = useState<CardSize>({ w: 360, h: 280 })
  const [shineHidden, setShineHidden] = useState(false)

  const holeTargetRef = useRef({ x: 0, y: 0, open: false })
  const holePosRef = useRef({ x: 0, y: 0 })
  const holeStrengthRef = useRef(0)

  useEffect(function measureCard() {
    const root = rootRef.current
    if (!root) return

    function syncSize() {
      if (!root) return
      const rect = root.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
    }

    syncSize()
    const observer = new ResizeObserver(syncSize)
    observer.observe(root)
    return function cleanup() {
      observer.disconnect()
    }
  }, [])

  useEffect(
    function animateHole() {
      if (reduceMotion) return

      let frame = 0
      let running = true

      function tick() {
        if (!running) return
        const target = holeTargetRef.current
        const pos = holePosRef.current
        const want = target.open ? 1 : 0
        let strength = holeStrengthRef.current
        strength += (want - strength) * HOLE_FADE
        if (Math.abs(want - strength) < 0.002) strength = want
        holeStrengthRef.current = strength

        if (target.open || strength > 0.01) {
          pos.x += (target.x - pos.x) * 0.35
          pos.y += (target.y - pos.y) * 0.35
        }

        const circle = holeCircleRef.current
        if (circle) {
          circle.setAttribute('cx', String(pos.x))
          circle.setAttribute('cy', String(pos.y))
          circle.setAttribute('r', String(HOLE_RADIUS * strength))
        }

        const ripples = ripplesRef.current
        if (ripples) {
          ripples.style.left = `${pos.x}px`
          ripples.style.top = `${pos.y}px`
          ripples.style.opacity = String(strength)
        }

        setShineHidden(function syncShine(prev) {
          const next = strength > 0.12
          return prev === next ? prev : next
        })

        frame = requestAnimationFrame(tick)
      }

      frame = requestAnimationFrame(tick)
      return function cleanup() {
        running = false
        cancelAnimationFrame(frame)
      }
    },
    [reduceMotion],
  )

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion) return
    const root = rootRef.current
    if (!root) return
    const rect = root.getBoundingClientRect()
    const nearControl = isNearControl(
      root,
      event.clientX,
      event.clientY,
      CONTROL_PAD,
    )
    holeTargetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      open: !nearControl,
    }
  }

  function onPointerLeave() {
    holeTargetRef.current = {
      ...holeTargetRef.current,
      open: false,
    }
  }

  const pad = 6
  const bodyW = Math.max(0, size.w - pad * 2)
  const bodyH = Math.max(0, size.h - pad * 2)

  const silhouetteMask: CSSProperties = {
    mask: `url(#${silhouetteId})`,
    WebkitMask: `url(#${silhouetteId})`,
  }

  const glassHoleMask: CSSProperties | undefined = reduceMotion
    ? undefined
    : {
        mask: `url(#${holeMaskId})`,
        WebkitMask: `url(#${holeMaskId})`,
      }

  return (
    <div
      ref={rootRef}
      data-card
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        'relative w-full will-change-transform',
        wide ? 'max-w-2xl' : 'max-w-xl',
        align === 'center' ? 'mx-auto' : align === 'end' ? 'ms-auto' : 'me-auto',
        className,
      )}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
        width={size.w}
        height={size.h}
      >
        <defs>
          <filter
            id={edgeFilterId}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" />
          </filter>
          <filter
            id={holeBlurId}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>
          <radialGradient id={holeFadeId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="black" />
            <stop offset="28%" stopColor="black" />
            <stop offset="48%" stopColor="#444" />
            <stop offset="68%" stopColor="#999" />
            <stop offset="85%" stopColor="#ddd" />
            <stop offset="100%" stopColor="white" />
          </radialGradient>
          <mask
            id={silhouetteId}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={size.w}
            height={size.h}
          >
            <rect
              x={pad}
              y={pad}
              width={bodyW}
              height={bodyH}
              rx={28}
              ry={28}
              fill="white"
              filter={`url(#${edgeFilterId})`}
            />
          </mask>
          <mask
            id={holeMaskId}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={size.w}
            height={size.h}
          >
            <rect width={size.w} height={size.h} fill="white" />
            <circle
              ref={holeCircleRef}
              cx={0}
              cy={0}
              r={0}
              fill={`url(#${holeFadeId})`}
              filter={`url(#${holeBlurId})`}
            />
          </mask>
        </defs>
      </svg>

      <LandingCardShine
        hidden={shineHidden}
        width={size.w}
        height={size.h}
      />
      <div className="relative" style={silhouetteMask}>
        <article className="relative overflow-hidden rounded-[1.5rem] border-0 shadow-[0_24px_70px_-32px_rgba(11,24,56,0.4)] sm:p-0">
          <div
            aria-hidden
            className={cn(
              'absolute inset-0 backdrop-blur-2xl',
              surfaceClassName ?? 'bg-base-100/94',
            )}
            style={glassHoleMask}
          >
            <div className={LANDING_CARD_PATTERN} />
          </div>
          {!reduceMotion ? (
            <div
              ref={ripplesRef}
              aria-hidden
              className="pointer-events-none absolute z-[5] size-0 opacity-0"
            >
              <span className="landing-hole-ripple absolute left-0 top-0 size-72 rounded-full border border-primary/45" />
              <span className="landing-hole-ripple landing-hole-ripple-delay absolute left-0 top-0 size-72 rounded-full border border-primary/30" />
              <span className="landing-hole-ripple landing-hole-ripple-delay-2 absolute left-0 top-0 size-72 rounded-full border border-base-content/20" />
            </div>
          ) : null}
          <div className="relative z-10 p-7 sm:p-9">{children}</div>
        </article>
      </div>

      <style>{`
        .landing-hole-ripple {
          animation: landing-hole-ripple 2.2s ease-out infinite;
        }
        .landing-hole-ripple-delay { animation-delay: 0.55s; }
        .landing-hole-ripple-delay-2 { animation-delay: 1.1s; }
        @keyframes landing-hole-ripple {
          0% { transform: translate(-50%, -50%) scale(0.25); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
