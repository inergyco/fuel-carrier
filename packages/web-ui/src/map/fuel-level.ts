import {
  FLEET_TOTAL_CAPACITY_LITERS,
  FUEL_LEVELS,
  getFuelLevel,
  type FuelLevel,
} from '@fuel-carrier/shared-types'

export { FLEET_TOTAL_CAPACITY_LITERS, FUEL_LEVELS, getFuelLevel }
export type { FuelLevel }

/** Marker / legend colors for remaining-fuel bands. */
export const FUEL_LEVEL_COLORS: Record<FuelLevel, string> = {
  high: 'var(--color-success)',
  midHigh: 'var(--color-info)',
  midLow: 'var(--color-warning)',
  low: 'var(--color-error)',
  unknown: 'color-mix(in oklab, var(--color-base-content) 35%, transparent)',
}

export function getFuelLevelColor(
  remainFuel: number | null | undefined,
): string {
  return FUEL_LEVEL_COLORS[getFuelLevel(remainFuel)]
}
