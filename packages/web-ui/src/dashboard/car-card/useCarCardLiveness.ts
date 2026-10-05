import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { useSyncExternalStore } from 'react'
import {
  TELEMETRY_LIVE_MAX_AGE_MS,
  type CarCardLiveness,
} from './car-card-utils'

/**
 * "Live" means telemetry `updatedAt` is less than 30s old.
 * The clock is an external store: we re-read it when that 30s window ends.
 */
export function useCarCardLiveness(
  telemetry: CarTelemetryMarker | null,
): CarCardLiveness {
  const updatedAt = telemetry?.updatedAt ?? null

  return useSyncExternalStore(
    function subscribe(onChange) {
      const expiresAtMs = getExpiresAtMs(updatedAt)
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
      return isLive(updatedAt) ? 'live' : 'offline'
    },
    function getServerSnapshot() {
      return 'offline'
    },
  )
}

function getExpiresAtMs(updatedAt: string | null): number | null {
  if (updatedAt == null) {
    return null
  }

  const updatedAtMs = Date.parse(updatedAt)
  if (!Number.isFinite(updatedAtMs)) {
    return null
  }

  return updatedAtMs + TELEMETRY_LIVE_MAX_AGE_MS
}

function isLive(updatedAt: string | null): boolean {
  const expiresAtMs = getExpiresAtMs(updatedAt)
  if (expiresAtMs == null) {
    return false
  }

  return Date.now() <= expiresAtMs
}
