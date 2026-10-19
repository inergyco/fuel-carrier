import { type Marker as LeafletMarker } from 'leaflet';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Marker } from 'react-leaflet';
import { animateLeafletMarkerTo } from './animate-marker-position';
import { markerIconForColor } from './car-marker-icon';

type AnimatedCarMarkerProps = {
  position: [number, number];
  color: string;
  children: ReactNode;
  instant?: boolean;
  selected?: boolean;
  plateLabel?: ReactNode;
};

/**
 * Keeps the React-Leaflet position prop stable and animates via Leaflet
 * `setLatLng` so live GPS updates glide instead of teleporting.
 * The icon instance stays stable so Leaflet does not rebuild the marker
 * DOM and wipe the plate portaled into it.
 */
export function AnimatedCarMarker({
  position,
  color,
  children,
  instant = false,
  selected = false,
  plateLabel = null,
}: AnimatedCarMarkerProps) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const [iconElement, setIconElement] = useState<HTMLElement | null>(null);
  const [markerIcon] = useState(() =>
    markerIconForColor({ color, selected }),
  );
  const [initialPosition] = useState(position);
  const endLat = position[0];
  const endLng = position[1];

  useEffect(function captureMarkerIcon() {
    const maybeMarker = markerRef.current;
    if (maybeMarker == null) {
      return;
    }

    function captureIconElement() {
      setIconElement(maybeMarker?.getElement() ?? null);
    }

    captureIconElement();
    maybeMarker.on('add', captureIconElement);

    return function stopCapturingIconElement() {
      maybeMarker.off('add', captureIconElement);
    };
  }, []);

  useEffect(
    function paintMarkerDot() {
      const dot = iconElement?.querySelector('.fuel-carrier-marker-dot');
      if (iconElement == null || !(dot instanceof HTMLElement)) {
        return;
      }

      const size = selected ? 18 : 14;
      const anchor = size / 2;
      const ring = selected ? 6 : 4;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.background = color;
      dot.style.boxShadow = `0 0 0 ${ring}px color-mix(in oklab, ${color} ${selected ? '40%' : '25%'}, transparent)`;
      iconElement.style.width = `${size}px`;
      iconElement.style.height = `${size}px`;
      iconElement.style.marginLeft = `${-anchor}px`;
      iconElement.style.marginTop = `${-anchor}px`;
    },
    [color, iconElement, selected],
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
    <>
      <Marker ref={markerRef} position={initialPosition} icon={markerIcon}>
        {children}
      </Marker>
      {iconElement != null && plateLabel != null
        ? createPortal(
            <span className="fuel-carrier-plate-anchor">
              <span className="fuel-carrier-plate-label">{plateLabel}</span>
            </span>,
            iconElement,
          )
        : null}
    </>
  );
}
