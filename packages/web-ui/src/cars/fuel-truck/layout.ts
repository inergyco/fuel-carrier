/** Shared layout for the BONIZ 500 schematic (viewBox matches the source art). */

export const VIEWBOX_WIDTH = 1024
export const VIEWBOX_HEIGHT = 582

export const MAX_TANKS = 3

/**
 * Tank interiors measured from the schematic, ordered front (cab) to rear.
 * Radii sit just inside the printed outlines so liquid never covers the ink.
 */
export const TANK_SLOTS = [
  { cx: 519.5, cy: 248, r: 57 },
  { cx: 390.5, cy: 248, r: 57 },
  { cx: 263, cy: 248, r: 57 },
] as const

export type TankSlot = {
  cx: number
  cy: number
  r: number
  filled: number
  index: number
}

export function clampFillRatio(capacity: number, filled: number): number {
  if (capacity <= 0) {
    return 0
  }
  return Math.min(1, Math.max(0, filled / capacity))
}

export function formatVolume(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    value,
  )
}

export function getVisibleTankSlots(filled: number[]): TankSlot[] {
  const levels = filled.slice(0, MAX_TANKS)

  return levels.flatMap(function toSlot(level, index) {
    const geometry = TANK_SLOTS[index]
    if (geometry === undefined) {
      return []
    }
    return [{ ...geometry, filled: level, index }]
  })
}
