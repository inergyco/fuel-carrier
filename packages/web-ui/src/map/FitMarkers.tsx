import type { CarTelemetryMarker } from '@fuel-carrier/shared-types';
import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { DEFAULT_ZOOM, IRAN_CENTER } from './map-constants';
import type { PathPoint } from './path-smoothing';

type FitMarkersProps = {
  markers: CarTelemetryMarker[];
  pathPoints?: readonly PathPoint[];
};

export function FitMarkers({ markers, pathPoints }: FitMarkersProps) {
  const map = useMap();
  const isPathMode = pathPoints !== undefined;
  const carIdsKey = markers
    .map(function toCarId(marker) {
      return marker.carId;
    })
    .sort()
    .join(',');
  const pathKey = (pathPoints ?? [])
    .map(function toPathSegment(point) {
      return `${point.latitude}:${point.longitude}`;
    })
    .join(',');

  useEffect(
    function fitBoundsToMarkers() {
      if (isPathMode) {
        if (pathPoints == null || pathPoints.length === 0) {
          return;
        }

        if (pathPoints.length === 1) {
          map.setView([pathPoints[0].latitude, pathPoints[0].longitude], 13);
          return;
        }

        const pathBounds = L.latLngBounds(
          pathPoints.map(function toPathLatLng(point) {
            return [point.latitude, point.longitude] as [number, number];
          }),
        );
        map.fitBounds(pathBounds, { padding: [48, 48], maxZoom: 14 });
        return;
      }

      if (markers.length === 0) {
        map.setView(IRAN_CENTER, DEFAULT_ZOOM);
        return;
      }

      if (markers.length === 1) {
        map.setView([markers[0].latitude, markers[0].longitude], 12);
        return;
      }

      const bounds = L.latLngBounds(
        markers.map(function toLatLng(marker) {
          return [marker.latitude, marker.longitude] as [number, number];
        }),
      );
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    },
    // markers/pathPoints are read when their identity keys change; omit from deps on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit on fleet membership or path contents only
    [map, carIdsKey, pathKey, isPathMode],
  );

  return null;
}
