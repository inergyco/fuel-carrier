import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import {
  DEFAULT_TANK_CAPACITY_LITERS,
  DEFAULT_TANK_COUNT,
} from '@fuel-carrier/web-ui/cars'

const MOVING_SPEED_KMH = 1

/** Matches the tanks diagram on the vehicle detail page. */
export const CAR_CARD_TOTAL_CAPACITY_LITERS =
  DEFAULT_TANK_CAPACITY_LITERS * DEFAULT_TANK_COUNT

export type CarCardMotionStatus = 'offline' | 'moving' | 'stopped'

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

export function getCarCardMotionStatus(
  telemetry: CarTelemetryMarker | null,
): CarCardMotionStatus {
  if (telemetry == null) {
    return 'offline'
  }

  if (telemetry.speed != null && telemetry.speed > MOVING_SPEED_KMH) {
    return 'moving'
  }

  return 'stopped'
}

export function getMotionStatusDotClass(status: CarCardMotionStatus): string {
  if (status === 'moving') {
    return 'bg-success'
  }

  if (status === 'stopped') {
    return 'bg-warning'
  }

  return 'bg-base-content/30'
}
