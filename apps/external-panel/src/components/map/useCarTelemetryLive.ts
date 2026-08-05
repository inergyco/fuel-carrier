import { useEffect } from 'react'
import {
  CarTelemetrySocketEvents,
  type CarTelemetryMarker,
} from '@fuel-carrier/shared-types'
import { useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { io, type Socket } from '@fuel-carrier/web-ui/socket'
import {
  carTelemetryKeys,
  fetchCarTelemetry,
} from '../../lib/api/car-telemetry'

const FALLBACK_REFETCH_MS = 60_000

/**
 * Initial snapshot via REST; live patches via Socket.IO (company-scoped).
 * Keeps a slow REST fallback if the socket drops.
 */
export function useCarTelemetryLive() {
  const queryClient = useQueryClient()

  const telemetryQuery = useQuery({
    queryKey: carTelemetryKeys.all,
    queryFn: fetchCarTelemetry,
    refetchInterval: FALLBACK_REFETCH_MS,
    refetchIntervalInBackground: false,
  })

  useEffect(
    function subscribeToCarTelemetrySocket() {
      const socket: Socket = io('/car-telemetry', {
        path: '/api/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'],
      })

      function onTelemetryUpdated(marker: CarTelemetryMarker) {
        queryClient.setQueryData<CarTelemetryMarker[]>(
          carTelemetryKeys.all,
          function upsertMarker(previous) {
            if (!previous) {
              return [marker]
            }

            const index = previous.findIndex(function matchCar(item) {
              return item.carId === marker.carId
            })

            if (index === -1) {
              return [...previous, marker]
            }

            const next = previous.slice()
            next[index] = marker
            return next
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
    [queryClient],
  )

  return telemetryQuery
}
