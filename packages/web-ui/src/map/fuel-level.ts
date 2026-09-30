import {
  DEFAULT_TANK_CAPACITY_LITERS,
  DEFAULT_TANK_COUNT,
} from '../cars/fuel-truck/distribute-remain-fuel'

/** Fleet tanks capacity used for map fuel-band percentages. */
export const FLEET_TOTAL_CAPACITY_LITERS =
  DEFAULT_TANK_CAPACITY_LITERS * DEFAULT_TANK_COUNT

export const FUEL_LEVELS = [
  'high',
  'midHigh',
  'midLow',
  'low',
  'unknown',
] as const

export type FuelLevel = (typeof FUEL_LEVELS)[number]

/** Marker / legend colors for remaining-fuel bands. */
export const FUEL_LEVEL_COLORS: Record<FuelLevel, string> = {
  high: 'var(--color-success)',
  midHigh: 'var(--color-info)',
  midLow: 'var(--color-warning)',
  low: 'var(--color-error)',
  unknown: 'color-mix(in oklab, var(--color-base-content) 35%, transparent)',
}

/**
 * Bands: ≥75% green, ≥50% blue, ≥25% orange, &lt;25% red.
 * Missing / non-finite remainFuel → unknown.
 */
export function getFuelLevel(remainFuel: number | null | undefined): FuelLevel {
  if (remainFuel == null || !Number.isFinite(remainFuel)) {
    return 'unknown'
  }

  const percent = Math.max(
    0,
    Math.min(100, (remainFuel / FLEET_TOTAL_CAPACITY_LITERS) * 100),
  )

  if (percent >= 75) {
    return 'high'
  }

  if (percent >= 50) {
    return 'midHigh'
  }

  if (percent >= 25) {
    return 'midLow'
  }

  return 'low'
}

export function getFuelLevelColor(
  remainFuel: number | null | undefined,
): string {
  return FUEL_LEVEL_COLORS[getFuelLevel(remainFuel)]
}
