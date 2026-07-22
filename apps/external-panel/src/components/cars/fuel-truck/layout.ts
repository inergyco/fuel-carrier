/** Shared SVG layout constants for the fuel-truck diagram (viewBox 0 0 720 280). */

export const VIEWBOX_WIDTH = 720
export const VIEWBOX_HEIGHT = 280

export const MAX_TANKS = 3

export const CAB_END_X = 204

/** Three body sections behind the cab. */
export const FRONT_BOX = { left: 204, right: 276 } as const
export const MIDDLE_BOX = { left: 276, right: 562 } as const
export const REAR_BOX = { left: 562, right: 668 } as const

export const BODY_TOP = 70
export const BODY_BOTTOM = 196

/** Circular tank geometry — sizes chosen to fit inside MIDDLE_BOX. */
export const TANK_RADIUS = 36
export const TANK_DIAMETER = TANK_RADIUS * 2
/** Edge-to-edge gap between adjacent tank circles. */
export const TANK_GAP = 18
export const TANK_CY = 132
export const MANIFOLD_Y = TANK_CY + TANK_RADIUS + 14

/** Horizontal padding inside the middle box before the first/last tank edge. */
const TANK_BOX_PADDING = 12

/** Evenly space tank centers inside the middle box using {@link TANK_GAP}. */
export function getTankCenters(count: number): number[] {
  if (count < 1 || count > MAX_TANKS) {
    return []
  }

  const minCx = MIDDLE_BOX.left + TANK_RADIUS + TANK_BOX_PADDING
  const maxCx = MIDDLE_BOX.right - TANK_RADIUS - TANK_BOX_PADDING
  const centerSpacing = TANK_DIAMETER + TANK_GAP
  const centerSpread = (count - 1) * centerSpacing
  const firstCx = minCx + (maxCx - minCx - centerSpread) / 2

  return Array.from({ length: count }, function centerAt(_: unknown, index: number) {
    return firstCx + index * centerSpacing
  })
}

export const AXLE_Y = 224
export const STEER_WHEEL = { cx: 94, r: 20 } as const
export const TRAILER_WHEEL = { cx: 468, r: 20 } as const
export const CHASSIS_TOP = 198
export const CHASSIS_BOTTOM = 226

export type TankSlot = {
  cx: number
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
  const centers = getTankCenters(levels.length)

  return levels.flatMap(function toSlot(level, index) {
    const cx = centers[index]
    if (cx === undefined) {
      return []
    }
    return [{ cx, filled: level, index }]
  })
}
