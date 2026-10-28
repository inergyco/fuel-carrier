import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ease = 'power4.out'

export function useLandingScroll(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(
    function bindScrollStory() {
      const root = rootRef.current
      if (!root || !enabled) return

      const ctx = gsap.context(function createStory() {
        root
          .querySelectorAll<HTMLElement>('[data-reveal="start"], [data-reveal="end"]')
          .forEach(function revealCard(node) {
            const fromEnd = node.dataset.reveal === 'end'
            const stage = node.closest('[data-stage]') ?? node
            const card =
              node.querySelector<HTMLElement>('[data-card]') ??
              node.querySelector<HTMLElement>('article') ??
              node
            const lines = card.querySelectorAll<HTMLElement>('[data-line]')

            function revealTrigger() {
              return {
                trigger: node,
                start: 'top 92%',
                endTrigger: stage,
                end: 'bottom 18%',
                toggleActions: 'play reverse play reverse',
              }
            }

            gsap.fromTo(
              card,
              {
                y: 56,
                opacity: 0,
                filter: 'blur(10px)',
              },
              {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1.25,
                ease,
                scrollTrigger: revealTrigger(),
              },
            )

            if (lines.length) {
              gsap.fromTo(
                lines,
                {
                  y: 28,
                  opacity: 0,
                  x: fromEnd ? 18 : -18,
                },
                {
                  y: 0,
                  opacity: 1,
                  x: 0,
                  duration: 0.9,
                  stagger: 0.08,
                  ease,
                  delay: 0.12,
                  scrollTrigger: revealTrigger(),
                },
              )
            }
          })

        root
          .querySelectorAll<HTMLElement>('[data-reveal="bridge"]')
          .forEach(function revealBridge(node) {
            gsap.fromTo(
              node,
              {
                y: 40,
                opacity: 0,
                filter: 'blur(8px)',
                letterSpacing: '0.08em',
              },
              {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                letterSpacing: '0em',
                duration: 1.15,
                ease,
                scrollTrigger: {
                  trigger: node,
                  start: 'top 88%',
                  end: 'top 36%',
                  toggleActions: 'play reverse play reverse',
                },
              },
            )
          })

        root
          .querySelectorAll<HTMLElement>('[data-reveal="cta"]')
          .forEach(function revealCta(node) {
            gsap.fromTo(
              node,
              {
                y: 40,
                opacity: 0,
                filter: 'blur(8px)',
              },
              {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1.15,
                ease,
                scrollTrigger: {
                  trigger: node,
                  start: 'top 88%',
                  toggleActions: 'play none none none',
                },
              },
            )
          })

        root
          .querySelectorAll<HTMLElement>('[data-sticky-image]')
          .forEach(function buryImage(img) {
            const stage = img.closest('[data-stage]')
            if (!stage) return
            const base = Number(img.dataset.scale) || 1.05
            gsap.fromTo(
              img,
              { scale: base, filter: 'brightness(1.05) saturate(1.05)' },
              {
                scale: base * 0.94,
                filter: 'brightness(0.88) saturate(0.95)',
                ease: 'none',
                scrollTrigger: {
                  trigger: stage,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 0.65,
                },
              },
            )
          })
      }, root)

      return function cleanup() {
        ctx.revert()
      }
    },
    [rootRef, enabled],
  )
}
