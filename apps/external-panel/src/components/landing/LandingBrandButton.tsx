import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@fuel-carrier/web-ui/utils'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const PROXIMITY = 110
const MAGNET = 4

type LandingBrandButtonProps = {
  onClick: () => void
  children: ReactNode
}

export function LandingBrandButton({ onClick, children }: LandingBrandButtonProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const motionRef = useRef<HTMLSpanElement>(null)
  const auraRef = useRef<HTMLSpanElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(
    function bindProximity() {
      const rootMaybe = rootRef.current
      const motionMaybe = motionRef.current
      const auraMaybe = auraRef.current
      if (!rootMaybe || !motionMaybe || !auraMaybe || reduceMotion) return
      if (!window.matchMedia(FINE_POINTER).matches) return
      const rootNode: HTMLButtonElement = rootMaybe
      const motionNode: HTMLSpanElement = motionMaybe
      const auraNode: HTMLSpanElement = auraMaybe

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
            : Math.max(0, 1 - dist / PROXIMITY) ** 1.4

          if (strength > 0) {
            targetX = Math.max(-MAGNET, Math.min(MAGNET, dx * 0.18 * strength))
            targetY = Math.max(
              -MAGNET * 0.6,
              Math.min(MAGNET * 0.6, dy * 0.14 * strength),
            )
          }
        }

        tx += (targetX - tx) * 0.16
        ty += (targetY - ty) * 0.16
        if (Math.abs(tx) < 0.05) tx = 0
        if (Math.abs(ty) < 0.05) ty = 0

        motionNode.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${1 + strength * 0.02})`
        auraNode.style.opacity = String(strength * 0.85)
        auraNode.style.transform = `scale(${0.85 + strength * 0.35})`

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
        'group relative flex min-w-0 items-center gap-3 rounded-lg outline-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40',
      )}
    >
      <span
        ref={auraRef}
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-2xl bg-primary/10 opacity-0 blur-md shadow-[0_0_28px_-6px] shadow-primary/40"
      />
      <span
        ref={motionRef}
        className="relative z-10 flex min-w-0 items-center gap-3 will-change-transform"
      >
        {children}
      </span>
    </button>
  )
}
