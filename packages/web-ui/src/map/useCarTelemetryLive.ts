import { useEffect } from 'react'
import {
  CarTelemetrySocketEvents,
  type CarTelemetryMarker,
} from '@fuel-carrier/shared-types'
import type { KyInstance } from '../api'
import { useQuery, useQueryClient } from '../query'
import { io, type Socket } from '../socket'

export const carTelemetryKeys = {
  all: ['car-telemetry'] as const,
}

const FALLBACK_REFETCH_MS = 60_000

export function fetchCarTelemetry(
  api: KyInstance,
): Promise<CarTelemetryMarker[]> {
  return api.get('car-telemetry').json<CarTelemetryMarker[]>()
}

function telemetryPortal(): 'internal' | 'external' {
  const prefix = String(import.meta.env.VITE_API_URL ?? '')
  return prefix.includes('/external') ? 'external' : 'internal'
}

export function applyTelemetryUpdated(
  previous: CarTelemetryMarker[] | undefined,
  marker: CarTelemetryMarker,
): CarTelemetryMarker[] {
  if (!previous) {
    return [marker]
  }

  const index = previous.findIndex(function matchCar(item) {
    return item.carId === marker.carId
  })

  if (index === -1) {
    const knownCompanyIds = new Set(
      previous.map(function toCompanyId(item) {
        return item.companyId
      }),
    )
    if (knownCompanyIds.size > 0 && !knownCompanyIds.has(marker.companyId)) {
      return previous
    }

    return [...previous, marker]
  }

  const next = previous.slice()
  next[index] = marker
  return next
}

/**
 * Initial snapshot via REST; live patches via Socket.IO.
 * Keeps a slow REST fallback if the socket drops.
 * Server rooms are tenant-scoped (company vs internal admin).
 */
export function useCarTelemetryLive(api: KyInstance) {
  const queryClient = useQueryClient()
  const portal = telemetryPortal()

  const telemetryQuery = useQuery({
    queryKey: carTelemetryKeys.all,
    queryFn: function loadCarTelemetry() {
      return fetchCarTelemetry(api)
    },
    refetchInterval: FALLBACK_REFETCH_MS,
    refetchIntervalInBackground: false,
  })

  useEffect(
    function subscribeToCarTelemetrySocket() {
      const socket: Socket = io('/car-telemetry', {
        path: '/api/socket.io',
        withCredentials: true,
        query: { portal },
        transports: ['websocket', 'polling'],
      })

      function onTelemetryUpdated(marker: CarTelemetryMarker) {
        queryClient.setQueryData<CarTelemetryMarker[]>(
          carTelemetryKeys.all,
          function upsertMarker(previous) {
            return applyTelemetryUpdated(previous, marker)
          },
        )
      }

      function onTelemetryRemoved(payload: { carId: string }) {
        queryClient.setQueryData<CarTelemetryMarker[]>(
          carTelemetryKeys.all,
          function removeMarker(previous) {
            if (!previous) {
              return previous
            }

            return previous.filter(function keepOther(item) {
              return item.carId !== payload.carId
            })
          },
        )
      }

      socket.on(CarTelemetrySocketEvents.TELEMETRY_UPDATED, onTelemetryUpdated)
      socket.on(CarTelemetrySocketEvents.TELEMETRY_REMOVED, onTelemetryRemoved)

      return function cleanupSocket() {
        socket.off(
          CarTelemetrySocketEvents.TELEMETRY_UPDATED,
          onTelemetryUpdated,
        )
        socket.off(
          CarTelemetrySocketEvents.TELEMETRY_REMOVED,
          onTelemetryRemoved,
        )
        socket.disconnect()
      }
    },
    [portal, queryClient],
  )

  return telemetryQuery
}
