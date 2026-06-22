import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(function resolveInitialMatch() {
    return window.matchMedia(query).matches
  })

  useEffect(function subscribeToMediaQuery() {
    const mediaQueryList = window.matchMedia(query)

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches)
    }

    setMatches(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', handleChange)

    return function cleanup() {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
