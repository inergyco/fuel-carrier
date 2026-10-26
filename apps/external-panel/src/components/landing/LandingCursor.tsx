import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
const MAX_VEL = 28
const INTERACTIVE =
  'button, a, [role="button"], input, select, textarea, [data-card]'

type Point = { x: number; y: number }

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export function LandingCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(
    function bindCursor() {
      const rootMaybe = rootRef.current
      if (!rootMaybe || reduceMotion) return
      if (!window.matchMedia(FINE_POINTER).matches) return
      const rootNode: HTMLDivElement = rootMaybe

      const target: Point = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }
      const pos: Point = { ...target }
      const vel: Point = { x: 0, y: 0 }
      let visible = false
      let paused = false
      let syncOnShow = true
      let frame = 0
      let time = 0
      let kick = 0
      let kickAngle = 0
      let running = true
      let lastNow = 0

      rootNode.style.opacity = '0'

      function setVisible(next: boolean) {
        visible = next
        rootNode.style.opacity = next ? '1' : '0'
      }

      function hardSyncToTarget() {
        pos.x = target.x
        pos.y = target.y
        vel.x = 0
        vel.y = 0
        kick = 0
      }

      function onMove(event: PointerEvent) {
        target.x = event.clientX
        target.y = event.clientY

        const overInteractive = Boolean(
          event.target instanceof Element &&
            event.target.closest(INTERACTIVE),
        )

        if (overInteractive) {
          paused = true
          setVisible(false)
          // Freeze spring so velocity does not keep stacking while hidden.
          vel.x = 0
          vel.y = 0
          kick = 0
          return
        }

        paused = false

        if (!visible) {
          if (syncOnShow) hardSyncToTarget()
          syncOnShow = false
          setVisible(true)
        }

        const speed = Math.hypot(event.movementX, event.movementY)
        if (speed > 22 && speed < 120) {
          kick = Math.min(12, kick + speed * 0.06)
          kickAngle =
            Math.atan2(event.movementY, event.movementX) +
            (Math.random() - 0.5) * 0.9
        }
      }

      function onLeave() {
        paused = true
        syncOnShow = true
        vel.x = 0
        vel.y = 0
        kick = 0
        setVisible(false)
      }

      function tick(now: number) {
        if (!running) return
        const rawDt = lastNow ? now - lastNow : 16.67
        lastNow = now
        // Ignore huge gaps (tab blur, lag) so the spring cannot explode.
        const dt = Math.min(32, Math.max(0, rawDt)) / 16.67
        time += dt

        if (!paused) {
          const stiffness = 0.014 + Math.sin(time * 0.022) * 0.004
          const damping = 0.92 + Math.sin(time * 0.015) * 0.02
          vel.x += (target.x - pos.x) * stiffness * dt
          vel.y += (target.y - pos.y) * stiffness * dt
          vel.x *= damping
          vel.y *= damping
          vel.x = clamp(vel.x, -MAX_VEL, MAX_VEL)
          vel.y = clamp(vel.y, -MAX_VEL, MAX_VEL)
          pos.x += vel.x * dt
          pos.y += vel.y * dt
        }

        kick *= 0.94
        const wobbleX =
          Math.sin(time * 0.06) * 7 +
          Math.sin(time * 0.15 + 1.1) * 4 +
          Math.cos(kickAngle) * kick
        const wobbleY =
          Math.cos(time * 0.07) * 6.5 +
          Math.sin(time * 0.12 + 0.5) * 3.5 +
          Math.sin(kickAngle) * kick

        rootNode.style.transform = `translate3d(${pos.x + wobbleX}px, ${pos.y + wobbleY}px, 0) translate(-50%, -50%)`

        frame = requestAnimationFrame(tick)
      }

      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('mouseleave', onLeave)
      frame = requestAnimationFrame(tick)

      return function cleanup() {
        running = false
        cancelAnimationFrame(frame)
        window.removeEventListener('pointermove', onMove)
        document.documentElement.removeEventListener('mouseleave', onLeave)
      }
    },
    [reduceMotion],
  )

  if (reduceMotion) return null

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30 size-3 opacity-0 transition-opacity duration-300"
    >
      <span className="absolute inset-[-140%] rounded-full bg-primary/25 blur-md" />
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary to-accent shadow-[0_0_14px_-1px] shadow-primary/55 ring-1 ring-primary-content/25" />
      <span className="absolute inset-[28%] rounded-full bg-primary-content/35 blur-[0.5px]" />
    </div>
  )
}
