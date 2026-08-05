import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { api } from '../api'

export const carTelemetryKeys = {
  all: ['car-telemetry'] as const,
}

export async function fetchCarTelemetry(): Promise<CarTelemetryMarker[]> {
  return api.get('car-telemetry').json<CarTelemetryMarker[]>()
}
