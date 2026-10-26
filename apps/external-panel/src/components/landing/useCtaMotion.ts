import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

type UseCtaMotionOptions = {
  rootRef: RefObject<HTMLElement | null>
  sheenRef: RefObject<HTMLElement | null>
  ringsRef: RefObject<HTMLElement | null>
  arrowRef: RefObject<SVGSVGElement | null>
  enabled: boolean
  spotlight?: boolean
  /** Soft pull when the cursor is near, not only hovering. */
  proximity?: number
}

export function useCtaMotion({
  rootRef,
  sheenRef,
  ringsRef,
  arrowRef,
  enabled,
  spotlight = false,
  proximity = 0,
}: UseCtaMotionOptions) {
  useEffect(
    function bindCtaMotion() {
      const rootMaybe = rootRef.current
      if (!rootMaybe || !enabled) return
      const rootNode: HTMLElement = rootMaybe

      const ctx = gsap.context(function createMotion() {
        const sheen = sheenRef.current
        const rings = ringsRef.current
        const arrow = arrowRef.current

        if (sheen) {
          gsap.set(sheen, { xPercent: -130, opacity: 0 })
          gsap.to(sheen, {
            keyframes: [
              { xPercent: -130, opacity: 0, duration: 0 },
              { xPercent: 0, opacity: 0.4, duration: 1.15 },
              { xPercent: 130, opacity: 0, duration: 1.15 },
            ],
            ease: 'sine.inOut',
            repeat: -1,
            repeatDelay: 2.4,
          })
        }

        if (spotlight && rings) {
          rings.querySelectorAll<HTMLElement>('[data-ring]').forEach(function pulseRing(ring, index) {
            gsap.fromTo(
              ring,
              { scale: 0.9, opacity: 0.4 },
              {
                scale: 1.6,
                opacity: 0,
                duration: 2.6,
                ease: 'power1.out',
                repeat: -1,
                delay: index * 0.85,
              },
            )
          })
        }

        if (arrow) {
          gsap.to(arrow, {
            x: 4,
            duration: 1.35,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
        }
      }, rootNode)

      let hovering = false
      const maxPull = spotlight ? 14 : 8
      const maxY = spotlight ? 10 : 5
      const maxRot = spotlight ? 2.8 : 1.4

      function applyFromPoint(clientX: number, clientY: number, strength: number) {
        const rect = rootNode.getBoundingClientRect()
        const x = (clientX - rect.left) / rect.width - 0.5
        const y = (clientY - rect.top) / rect.height - 0.5
        gsap.to(rootNode, {
          x: x * maxPull * strength,
          y: y * maxY * strength,
          rotate: x * maxRot * strength,
          scale: 1 + (spotlight ? 0.055 : 0.032) * strength,
          duration: 0.4,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }

      function reset() {
        gsap.to(rootNode, {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 0.65,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }

      function onMove(event: PointerEvent) {
        applyFromPoint(event.clientX, event.clientY, 1)
      }

      function onEnter() {
        hovering = true
      }

      function onLeave() {
        hovering = false
        reset()
      }

      function onWindowMove(event: PointerEvent) {
        if (hovering || proximity <= 0) return
        if (!window.matchMedia(FINE_POINTER).matches) return

        const rect = rootNode.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.hypot(event.clientX - cx, event.clientY - cy)
        const edge = Math.hypot(rect.width / 2, rect.height / 2)
        const gap = Math.max(0, dist - edge)

        if (gap >= proximity) {
          reset()
          return
        }

        const strength = (1 - gap / proximity) ** 1.3
        applyFromPoint(event.clientX, event.clientY, strength)
      }

      rootNode.addEventListener('pointermove', onMove)
      rootNode.addEventListener('pointerenter', onEnter)
      rootNode.addEventListener('pointerleave', onLeave)
      if (proximity > 0) {
        window.addEventListener('pointermove', onWindowMove, { passive: true })
      }

      return function cleanup() {
        rootNode.removeEventListener('pointermove', onMove)
        rootNode.removeEventListener('pointerenter', onEnter)
        rootNode.removeEventListener('pointerleave', onLeave)
        if (proximity > 0) {
          window.removeEventListener('pointermove', onWindowMove)
        }
        ctx.revert()
      }
    },
    [rootRef, sheenRef, ringsRef, arrowRef, enabled, spotlight, proximity],
  )
}
