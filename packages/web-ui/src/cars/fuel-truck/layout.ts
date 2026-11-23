/** Shared visible frame across both BONIZ schematics. */
export const VIEWBOX_X = 18
export const VIEWBOX_Y = 107
export const VIEWBOX_WIDTH = 1006
export const VIEWBOX_HEIGHT = 392

export type TruckArtMetrics = {
  width: number
  height: number
  viewBoxX: number
  viewBoxY: number
  viewBoxWidth: number
  viewBoxHeight: number
}

/** Three-tank BONIZ 500 art and crop. */
export const THREE_TANK_ART: TruckArtMetrics = {
  width: 1024,
  height: 582,
  viewBoxX: VIEWBOX_X,
  viewBoxY: VIEWBOX_Y,
  viewBoxWidth: VIEWBOX_WIDTH,
  viewBoxHeight: VIEWBOX_HEIGHT,
}

/** One-tank BONIZ 300 art and crop. */
export const ONE_TANK_ART: TruckArtMetrics = {
  width: 1024,
  height: 682,
  viewBoxX: 12,
  viewBoxY: 118,
  viewBoxWidth: 1000,
  viewBoxHeight: 400,
}

/**
 * Three-tank interiors, ordered front (cab) to rear.
 * Radii sit just inside the printed outlines so liquid never covers the ink.
 */
export const TANK_SLOTS = [
  { cx: 519.5, cy: 248, rx: 57, ry: 57 },
  { cx: 390.5, cy: 248, rx: 57, ry: 57 },
  { cx: 263, cy: 248, rx: 57, ry: 57 },
] as const

/**
 * One-tank interior. Rounded rectangle tight to the printed corners.
 */
export const SINGLE_TANK_SLOTS = [
  { cx: 387, cy: 260, rx: 196, ry: 71, endRx: 40 },
] as const

export type TankSlot = {
  cx: number
  cy: number
  rx: number
  ry: number
  /** Corner radius. Semicircular ends when omitted. */
  endRx?: number
  filled: number
  index: number
}

export function getTruckArtMetrics(tankCount: number): TruckArtMetrics {
  if (tankCount === 1) {
    return ONE_TANK_ART
  }

  return THREE_TANK_ART
}

export function clampFillRatio(capacity: number, filled: number): number {
  if (capacity <= 0) {
    return 0
  }
  return Math.min(1, Math.max(0, filled / capacity))
}

export function formatVolume(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    value,
  )
}

export function getVisibleTankSlots(filled: number[]): TankSlot[] {
  const geometry = filled.length === 1 ? SINGLE_TANK_SLOTS : TANK_SLOTS
  const levels = filled.slice(0, geometry.length)

  return levels.flatMap(function toSlot(level, index) {
    const slot = geometry[index]
    if (slot === undefined) {
      return []
    }
    return [{ ...slot, filled: level, index }]
  })
}
