import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'

export function getRemainFuelLiters(
  telemetry: CarTelemetryMarker | null,
): number | null {
  if (telemetry?.remainFuel == null || !Number.isFinite(telemetry.remainFuel)) {
    return null
  }

  return Math.max(0, telemetry.remainFuel)
}

export function getFuelFillPercent(
  remainFuel: number | null,
  totalCapacityLiters: number,
): number | null {
  if (remainFuel == null || totalCapacityLiters <= 0) {
    return null
  }

  const percent = (remainFuel / totalCapacityLiters) * 100

  return Math.min(100, Math.round(percent * 10) / 10)
}

export const formatFillPercent = (fillPercent: number) =>
  `${fillPercent.toFixed(1)}%`
