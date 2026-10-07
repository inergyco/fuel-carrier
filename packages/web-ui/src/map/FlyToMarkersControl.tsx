import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import { useEffect, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'
import { LocateFixed } from '../icons'
import { fitMapToContent } from './fit-map-to-content'
import { MapControlButton } from './MapControlButton'
import type { PathPoint } from './path-smoothing'
import { useLeafletControlPortal } from './useLeafletControlPortal'

export type FlyToMarkersControlLabels = {
  flyToMarkers: () => string
}

type FlyToMarkersControlProps = {
  markers: CarTelemetryMarker[]
  pathPoints?: readonly PathPoint[]
  labels: FlyToMarkersControlLabels
}

export function FlyToMarkersControl({
  markers,
  pathPoints,
  labels,
}: FlyToMarkersControlProps) {
  const map = useMap()
  const container = useLeafletControlPortal({
    position: 'topright',
    className: 'fuel-carrier-fly-to-markers',
  })
  const isPathMode = pathPoints !== undefined
  const carIdsKey = markers
    .map((marker) => marker.carId)
    .sort()
    .join(',')
  const pathKey = (pathPoints ?? [])
    .map((point) => `${point.latitude}:${point.longitude}`)
    .join(',')

  useEffect(
    function fitBoundsToMarkers() {
      fitMapToContent(map, { markers, pathPoints })
    },
    // markers/pathPoints are read when their identity keys change; omit from deps on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit on fleet membership or path contents only
    [map, carIdsKey, pathKey, isPathMode],
  )

  if (container == null) {
    return null
  }

  const hasTargets =
    (pathPoints !== undefined && pathPoints.length > 0) || markers.length > 0

  function handleFlyToMarkers(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    fitMapToContent(map, { markers, pathPoints, animate: true })
  }

  return createPortal(
    <MapControlButton
      label={labels.flyToMarkers()}
      disabled={!hasTargets}
      onClick={handleFlyToMarkers}
    >
      <LocateFixed className="size-5" aria-hidden />
    </MapControlButton>,
    container,
  )
}
