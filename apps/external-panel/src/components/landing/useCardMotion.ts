import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'
/** How far outside the card the pull field reaches (px). */
const FIELD_RADIUS = 180
/** Max translation toward the cursor (px). */
const MAX_PULL = 14
/** Max 3D tilt (deg). */
const MAX_TILT = 7

type UseCardMotionOptions = {
  rootRef: RefObject<HTMLElement | null>
  enabled: boolean
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** Soft falloff: 1 at contact, 0 at field edge. */
function fieldStrength(distance: number) {
  if (distance <= 0) return 1
  if (distance >= FIELD_RADIUS) return 0
  const t = 1 - distance / FIELD_RADIUS
  return t * t * (3 - 2 * t)
}

export function useCardMotion({ rootRef, enabled }: UseCardMotionOptions) {
  useEffect(
    function bindCardMotion() {
      const root = rootRef.current
      if (!root || !enabled) return
      if (!window.matchMedia(FINE_POINTER).matches) return

      let inView = false
      let hovering = false
      let settled = true

      gsap.set(root, {
        transformPerspective: 900,
        transformOrigin: '50% 50%',
      })

      function settle() {
        if (settled) return
        settled = true
        gsap.to(root, {
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.75,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }

      function onMove(event: PointerEvent) {
        if (!inView) return

        const rect = root!.getBoundingClientRect()
        const px = event.clientX
        const py = event.clientY

        // Distance to nearest edge (0 while pointer is over the card).
        const dx = Math.max(rect.left - px, 0, px - rect.right)
        const dy = Math.max(rect.top - py, 0, py - rect.bottom)
        const dist = Math.hypot(dx, dy)
        const strength = fieldStrength(dist)

        if (strength <= 0.001) {
          settle()
          return
        }

        settled = false
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const nx = clamp((px - cx) / (rect.width * 0.5), -1.35, 1.35)
        const ny = clamp((py - cy) / (rect.height * 0.5), -1.35, 1.35)

        // Gravity: card leans and drifts toward the cursor; stronger when close.
        const pull = MAX_PULL * strength
        gsap.to(root, {
          x: nx * pull,
          y: ny * pull * 0.72,
          rotateY: nx * MAX_TILT * strength,
          rotateX: -ny * MAX_TILT * 0.85 * strength,
          scale: hovering ? 1.018 : 1 + 0.01 * strength,
          duration: hovering ? 0.35 : 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }

      function onEnter() {
        hovering = true
      }

      function onLeave() {
        hovering = false
      }

      const observer = new IntersectionObserver(
        function onIntersect(entries) {
          inView = entries.some((entry) => entry.isIntersecting)
          if (!inView) settle()
        },
        { rootMargin: `${FIELD_RADIUS}px`, threshold: 0 },
      )
      observer.observe(root)

      window.addEventListener('pointermove', onMove, { passive: true })
      root.addEventListener('pointerenter', onEnter)
      root.addEventListener('pointerleave', onLeave)

      return function cleanup() {
        observer.disconnect()
        window.removeEventListener('pointermove', onMove)
        root.removeEventListener('pointerenter', onEnter)
        root.removeEventListener('pointerleave', onLeave)
        gsap.killTweensOf(root)
        gsap.set(root, {
          clearProps: 'transform,x,y,rotateX,rotateY,scale',
        })
      }
    },
    [rootRef, enabled],
  )
}
