/** Shared SVG layout constants for the fuel-truck diagram (viewBox 0 0 720 280). */

export const VIEWBOX_WIDTH = 720
export const VIEWBOX_HEIGHT = 280

export const MAX_TANKS = 3

/** Horizontal centers for up to three tank slots on the trailer. */
export const TANK_CENTERS = [292, 420, 548] as const

export const TANK_WIDTH = 104
export const TANK_BODY_TOP = 68
export const TANK_BODY_HEIGHT = 108
export const TANK_RX = 22
export const LIQUID_INSET = 5
export const MANIFOLD_Y = 184
export const DECK_TOP = 196
/** Label baseline in viewBox Y — overlays align to this. */
export const TANK_LABEL_Y = TANK_BODY_TOP - 14

export const AXLE_Y = 228
export const STEER_WHEEL = { cx: 96, r: 22 } as const
export const TRAILER_WHEEL_R = 17
export const CHASSIS_TOP = 210
export const CHASSIS_BOTTOM = 230

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

/** Centers + filled levels for the tanks currently shown (1–3). */
export function getVisibleTankSlots(filled: number[]): Array<{
  cx: number
  filled: number
  index: number
}> {
  const levels = filled.slice(0, MAX_TANKS)
  const startSlot = Math.floor((MAX_TANKS - levels.length) / 2)

  return levels.flatMap(function toSlot(level, index) {
    const cx = TANK_CENTERS[startSlot + index]
    if (cx === undefined) {
      return []
    }
    return [{ cx, filled: level, index }]
  })
}
