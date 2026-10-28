import { useSyncExternalStore } from 'react'

/** Server ingest older than this is treated as offline (not live). */
export const TELEMETRY_LIVE_MAX_AGE_MS = 90_000

export type TelemetryLiveness = 'live' | 'offline'

/**
 * "Live" means server ingest time is within TELEMETRY_LIVE_MAX_AGE_MS.
 * The clock is an external store: we re-read it when that window ends.
 */
export function useTelemetryLiveness(
  ingestedAt: string | null,
): TelemetryLiveness {
  return useSyncExternalStore(
    function subscribe(onChange) {
      const expiresAtMs = getExpiresAtMs(ingestedAt)
      if (expiresAtMs == null) {
        return function unsubscribe() {}
      }

      const timeoutId = window.setTimeout(
        onChange,
        Math.max(0, expiresAtMs - Date.now()),
      )

      return function unsubscribe() {
        window.clearTimeout(timeoutId)
      }
    },
    function getSnapshot() {
      return isTelemetryLive(ingestedAt) ? 'live' : 'offline'
    },
    function getServerSnapshot() {
      return 'offline'
    },
  )
}

function getExpiresAtMs(ingestedAt: string | null): number | null {
  if (ingestedAt == null) {
    return null
  }

  const ingestedAtMs = Date.parse(ingestedAt)
  if (!Number.isFinite(ingestedAtMs)) {
    return null
  }

  return ingestedAtMs + TELEMETRY_LIVE_MAX_AGE_MS
}

function isTelemetryLive(ingestedAt: string | null): boolean {
  const expiresAtMs = getExpiresAtMs(ingestedAt)
  if (expiresAtMs == null) {
    return false
  }

  return Date.now() <= expiresAtMs
}
