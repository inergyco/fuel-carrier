import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(function readInitial() {
    if (typeof window === 'undefined') return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(function subscribeReducedMotion() {
    const media = window.matchMedia(QUERY)
    function onChange() {
      setReduced(media.matches)
    }
    onChange()
    media.addEventListener('change', onChange)
    return function cleanup() {
      media.removeEventListener('change', onChange)
    }
  }, [])

  return reduced
}
