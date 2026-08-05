import { useEffect } from 'react'
import {
  CarLocationSocketEvents,
  type CarLocationMarker,
} from '@fuel-carrier/shared-types'
import { useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import { io, type Socket } from '@fuel-carrier/web-ui/socket'
import {
  carLocationKeys,
  fetchCarLocations,
} from '../../lib/api/car-locations'

const FALLBACK_REFETCH_MS = 60_000

/**
 * Initial snapshot via REST; live patches via Socket.IO (company-scoped).
 * Keeps a slow REST fallback if the socket drops.
 */
export function useCarLocationsLive() {
  const queryClient = useQueryClient()

  const locationsQuery = useQuery({
    queryKey: carLocationKeys.all,
    queryFn: fetchCarLocations,
    refetchInterval: FALLBACK_REFETCH_MS,
    refetchIntervalInBackground: false,
  })

  useEffect(
    function subscribeToCarLocationSocket() {
      const socket: Socket = io('/car-locations', {
        path: '/api/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'],
      })

      function onLocationUpdated(marker: CarLocationMarker) {
        queryClient.setQueryData<CarLocationMarker[]>(
          carLocationKeys.all,
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

      function onLocationRemoved(payload: { carId: string }) {
        queryClient.setQueryData<CarLocationMarker[]>(
          carLocationKeys.all,
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

      socket.on(CarLocationSocketEvents.LOCATION_UPDATED, onLocationUpdated)
      socket.on(CarLocationSocketEvents.LOCATION_REMOVED, onLocationRemoved)

      return function cleanupSocket() {
        socket.off(
          CarLocationSocketEvents.LOCATION_UPDATED,
          onLocationUpdated,
        )
        socket.off(
          CarLocationSocketEvents.LOCATION_REMOVED,
          onLocationRemoved,
        )
        socket.disconnect()
      }
    },
    [queryClient],
  )

  return locationsQuery
}
