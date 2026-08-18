import L, { type Marker as LeafletMarker } from 'leaflet';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Marker } from 'react-leaflet';
import { animateLeafletMarkerTo } from './animate-marker-position';

type AnimatedCarMarkerProps = {
  position: [number, number];
  icon: L.DivIcon;
  children: ReactNode;
  instant?: boolean;
};

/**
 * Keeps the React-Leaflet position prop stable and animates via Leaflet
 * `setLatLng` so live GPS updates glide instead of teleporting.
 */
export function AnimatedCarMarker({
  position,
  icon,
  children,
  instant = false,
}: AnimatedCarMarkerProps) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const [initialPosition] = useState(position);
  const endLat = position[0];
  const endLng = position[1];

  useEffect(
    function updateMarkerIcon() {
      const maybeMarker = markerRef.current;
      if (maybeMarker == null) {
        return;
      }

      maybeMarker.setIcon(icon);
    },
    [icon],
  );

  useEffect(
    function animateToTarget() {
      const maybeMarker = markerRef.current;
      if (maybeMarker == null) {
        return;
      }

      if (instant) {
        maybeMarker.setLatLng([endLat, endLng]);
        return;
      }

      const cancel = animateLeafletMarkerTo(maybeMarker, endLat, endLng);
      return cancel ?? undefined;
    },
    [endLat, endLng, instant],
  );

  return (
    <Marker ref={markerRef} position={initialPosition} icon={icon}>
      {children}
    </Marker>
  );
}
