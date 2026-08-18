import { CircleMarker, Polyline } from 'react-leaflet';
import type { PathPoint } from './path-smoothing';

type TrajectoryPathLayerProps = {
  pathPoints: readonly PathPoint[];
  smoothedPath: [number, number][];
};

export function TrajectoryPathLayer({
  pathPoints,
  smoothedPath,
}: TrajectoryPathLayerProps) {
  if (pathPoints.length === 0) {
    return null;
  }

  const start = pathPoints[0];
  const end = pathPoints[pathPoints.length - 1];

  return (
    <>
      {smoothedPath.length > 1 ? (
        <Polyline
          positions={smoothedPath}
          pathOptions={{
            color: 'var(--color-primary)',
            weight: 4,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      ) : null}
      <CircleMarker
        center={[start.latitude, start.longitude]}
        radius={7}
        pathOptions={{
          color: 'var(--color-base-100)',
          weight: 2,
          fillColor: 'var(--color-primary)',
          fillOpacity: 1,
        }}
      />
      <CircleMarker
        center={[end.latitude, end.longitude]}
        radius={8}
        pathOptions={{
          color: 'var(--color-base-100)',
          weight: 2,
          fillColor: 'var(--color-secondary, var(--color-primary))',
          fillOpacity: 1,
        }}
      />
    </>
  );
}
