import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { DEFAULT_TANK_CAPACITY_LITERS, DEFAULT_TANK_COUNT } from '../../cars'

/** Matches the tanks diagram on the vehicle detail page. */
export const CAR_CARD_TOTAL_CAPACITY_LITERS =
  DEFAULT_TANK_CAPACITY_LITERS * DEFAULT_TANK_COUNT

/** Telemetry older than this is treated as offline (not live). */
export const TELEMETRY_LIVE_MAX_AGE_MS = 30_000

export type CarCardLiveness = 'live' | 'offline'

export function getRemainFuelLiters(
  telemetry: CarTelemetryMarker | null,
): number | null {
  if (telemetry?.remainFuel == null || !Number.isFinite(telemetry.remainFuel)) {
    return null
  }

  return Math.max(0, telemetry.remainFuel)
}

export function getFuelFillPercent(remainFuel: number | null): number | null {
  if (remainFuel == null) {
    return null
  }

  return Math.min(
    100,
    Math.round((remainFuel / CAR_CARD_TOTAL_CAPACITY_LITERS) * 100),
  )
}
