import type { Marker as LeafletMarker } from "leaflet";

/** Match typical live/simulate tick so markers glide instead of jump. */
export const MARKER_ANIMATION_MS = 1000;

export type LatLngTuple = [number, number];

export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function animationProgress(
  now: number,
  startedAt: number,
  durationMs: number,
): number {
  return Math.min(1, (now - startedAt) / durationMs);
}

export function interpolateLatLng(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  t: number,
): LatLngTuple {
  const eased = easeOutQuad(t);
  return [
    startLat + (endLat - startLat) * eased,
    startLng + (endLng - startLng) * eased,
  ];
}

/**
 * Animates a Leaflet marker from its current position to a target.
 * Returns a cancel function, or `null` when already at the target.
 */
export function animateLeafletMarkerTo(
  marker: LeafletMarker,
  endLat: number,
  endLng: number,
  durationMs: number = MARKER_ANIMATION_MS,
): (() => void) | null {
  const start = marker.getLatLng();
  const startLat = start.lat;
  const startLng = start.lng;

  if (startLat === endLat && startLng === endLng) {
    return null;
  }

  let rafId: number | null = null;
  const startedAt = performance.now();

  function frame(now: number) {
    const t = animationProgress(now, startedAt, durationMs);
    marker.setLatLng(
      interpolateLatLng(startLat, startLng, endLat, endLng, t),
    );

    if (t < 1) {
      rafId = requestAnimationFrame(frame);
      return;
    }

    rafId = null;
  }

  rafId = requestAnimationFrame(frame);

  return function cancelMarkerAnimation() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}
