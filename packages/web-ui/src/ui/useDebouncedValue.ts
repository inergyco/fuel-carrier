import { useEffect, useState } from 'react'

export const DEFAULT_DEBOUNCE_MS = 300

/**
 * Returns `value` after it has stayed unchanged for `delayMs`.
 * The first render mirrors `value` immediately (no initial delay).
 */
export function useDebouncedValue<T>(
  value: T,
  delayMs = DEFAULT_DEBOUNCE_MS,
): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(
    function debounceValue() {
      const timeoutId = window.setTimeout(function commitDebouncedValue() {
        setDebouncedValue(value)
      }, delayMs)

      return function clearDebounce() {
        window.clearTimeout(timeoutId)
      }
    },
    [value, delayMs],
  )

  return debouncedValue
}
