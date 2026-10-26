export function scrollToSection(options: {
  id: string
  behavior?: ScrollBehavior
  offset?: number
}) {
  const { id, behavior = 'smooth', offset = 0 } = options
  const target = document.getElementById(id)
  if (!target) return false

  const top = Math.max(
    0,
    target.getBoundingClientRect().top + window.pageYOffset - offset,
  )

  // Prefer window.scrollTo — scrollIntoView can no-op when GSAP transforms
  // ancestors or when a hash update races the animation.
  window.scrollTo({ top, behavior })
  return true
}
