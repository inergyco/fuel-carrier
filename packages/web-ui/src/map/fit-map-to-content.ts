import type { CarTelemetryMarker } from '@fuel-carrier/shared-types'
import type { Map as LeafletMap } from 'leaflet'
import L from 'leaflet'
import { DEFAULT_ZOOM, IRAN_CENTER } from './map-constants'
import type { PathPoint } from './path-smoothing'

export type FitMapToContentOptions = {
  markers: CarTelemetryMarker[]
  pathPoints?: readonly PathPoint[]
  animate?: boolean
}

export function fitMapToContent(
  map: LeafletMap,
  { markers, pathPoints, animate = false }: FitMapToContentOptions,
): void {
  const isPathMode = pathPoints !== undefined

  if (isPathMode) {
    fitToPathPoints(map, pathPoints ?? [], animate)
    return
  }

  fitToMarkers(map, markers, animate)
}

function fitToPathPoints(
  map: LeafletMap,
  pathPoints: readonly PathPoint[],
  animate: boolean,
): void {
  if (pathPoints.length === 0) {
    return
  }

  if (pathPoints.length === 1) {
    moveMapTo(
      map,
      [pathPoints[0].latitude, pathPoints[0].longitude],
      13,
      animate,
    )
    return
  }

  const pathBounds = L.latLngBounds(
    pathPoints.map((point) => [point.latitude, point.longitude] as [number, number]),
  )
  fitMapBounds(map, pathBounds, { padding: [48, 48], maxZoom: 14 }, animate)
}

function fitToMarkers(
  map: LeafletMap,
  markers: CarTelemetryMarker[],
  animate: boolean,
): void {
  if (markers.length === 0) {
    moveMapTo(map, IRAN_CENTER, DEFAULT_ZOOM, animate)
    return
  }

  if (markers.length === 1) {
    moveMapTo(
      map,
      [markers[0].latitude, markers[0].longitude],
      12,
      animate,
    )
    return
  }

  const bounds = L.latLngBounds(
    markers.map((marker) => [marker.latitude, marker.longitude] as [number, number]),
  )
  fitMapBounds(map, bounds, { padding: [48, 48], maxZoom: 12 }, animate)
}

function moveMapTo(
  map: LeafletMap,
  center: [number, number],
  zoom: number,
  animate: boolean,
): void {
  if (animate) {
    map.flyTo(center, zoom)
    return
  }

  map.setView(center, zoom)
}

function fitMapBounds(
  map: LeafletMap,
  bounds: L.LatLngBounds,
  options: L.FitBoundsOptions,
  animate: boolean,
): void {
  if (animate) {
    map.flyToBounds(bounds, options)
    return
  }

  map.fitBounds(bounds, options)
}
