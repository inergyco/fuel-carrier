import { useEffect, useRef } from 'react'
import { cn } from '@fuel-carrier/web-ui/utils'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const PROXIMITY = 88
const MAGNET = 5

type LandingNavLinkProps = {
  label: string
  onClick: () => void
}

export function LandingNavLink({ label, onClick }: LandingNavLinkProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const motionRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)
  const lineRef = useRef<HTMLSpanElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(
    function bindProximity() {
      const rootMaybe = rootRef.current
      const motionMaybe = motionRef.current
      const glowMaybe = glowRef.current
      const lineMaybe = lineRef.current
      const dotMaybe = dotRef.current
      if (
        !rootMaybe ||
        !motionMaybe ||
        !glowMaybe ||
        !lineMaybe ||
        !dotMaybe ||
        reduceMotion
      ) {
        return
      }
      if (!window.matchMedia(FINE_POINTER).matches) return
      const rootNode: HTMLButtonElement = rootMaybe
      const motionNode: HTMLSpanElement = motionMaybe
      const glowNode: HTMLSpanElement = glowMaybe
      const lineNode: HTMLSpanElement = lineMaybe
      const dotNode: HTMLSpanElement = dotMaybe

      let frame = 0
      let running = true
      let pointer: { x: number; y: number; inside: boolean } | null = null
      let tx = 0
      let ty = 0

      function onMove(event: PointerEvent) {
        pointer = { x: event.clientX, y: event.clientY, inside: true }
      }

      function onLeaveDoc() {
        if (pointer) pointer.inside = false
      }

      function tick() {
        if (!running) return
        // Root never translates — resting center stays stable (no feedback loop).
        const rect = rootNode.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2

        let targetX = 0
        let targetY = 0
        let strength = 0

        if (pointer?.inside) {
          const dx = pointer.x - cx
          const dy = pointer.y - cy
          const dist = Math.hypot(dx, dy)
          const inside =
            pointer.x >= rect.left &&
            pointer.x <= rect.right &&
            pointer.y >= rect.top &&
            pointer.y <= rect.bottom

          strength = inside
            ? 1
            : Math.max(0, 1 - dist / PROXIMITY) ** 1.35

          if (strength > 0) {
            // Pull is a fraction of offset from resting center — capped, stable.
            targetX = Math.max(-MAGNET, Math.min(MAGNET, dx * 0.22 * strength))
            targetY = Math.max(
              -MAGNET * 0.65,
              Math.min(MAGNET * 0.65, dy * 0.18 * strength),
            )
          }
        }

        tx += (targetX - tx) * 0.18
        ty += (targetY - ty) * 0.18
        if (Math.abs(tx) < 0.05) tx = 0
        if (Math.abs(ty) < 0.05) ty = 0

        motionNode.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
        rootNode.style.opacity = String(0.72 + strength * 0.28)
        glowNode.style.opacity = String(strength * 0.9)
        glowNode.style.transform = `scale(${0.7 + strength * 0.55})`
        lineNode.style.transform = `scaleX(${0.12 + strength * 0.88})`
        lineNode.style.opacity = String(0.2 + strength * 0.8)
        dotNode.style.opacity = String(strength)
        dotNode.style.transform = `translateX(-50%) scale(${0.4 + strength * 0.6})`

        frame = requestAnimationFrame(tick)
      }

      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('mouseleave', onLeaveDoc)
      frame = requestAnimationFrame(tick)

      return function cleanup() {
        running = false
        cancelAnimationFrame(frame)
        window.removeEventListener('pointermove', onMove)
        document.documentElement.removeEventListener('mouseleave', onLeaveDoc)
        motionNode.style.transform = ''
        rootNode.style.opacity = ''
      }
    },
    [reduceMotion],
  )

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex h-11 items-center rounded-lg px-3 text-sm font-semibold tracking-wide opacity-75 transition-[color,background-color] duration-300 sm:px-4 sm:text-[0.95rem]',
        'hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40',
        reduceMotion &&
          'hover:bg-base-content/8 hover:opacity-100 [[data-theme=external-dark]_&]:hover:bg-white/8',
      )}
    >
      <span
        ref={motionRef}
        className="relative inline-flex h-full w-full items-center justify-center will-change-transform"
      >
        <span
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg bg-primary/12 opacity-0 blur-[2px] shadow-[0_0_22px_-4px] shadow-primary/50"
        />
        <span className="relative z-10">{label}</span>
        <span
          ref={dotRef}
          aria-hidden
          className="pointer-events-none absolute start-1/2 top-1.5 size-1 -translate-x-1/2 rounded-full bg-primary opacity-0 shadow-[0_0_8px] shadow-primary"
        />
        <span
          ref={lineRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-center scale-x-[0.12] rounded-full bg-primary opacity-20"
        />
      </span>
    </button>
  )
}
