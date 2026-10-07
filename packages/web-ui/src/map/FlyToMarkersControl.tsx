import type { CarTelemetryMarker } from "@fuel-carrier/shared-types";
import L from "leaflet";
import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import { LocateFixed } from "../icons";
import { cn } from "../utils";
import { fitMapToContent } from "./fit-map-to-content";
import type { PathPoint } from "./path-smoothing";

export type FlyToMarkersControlLabels = {
  flyToMarkers: () => string;
};

type FlyToMarkersControlProps = {
  markers: CarTelemetryMarker[];
  pathPoints?: readonly PathPoint[];
  labels: FlyToMarkersControlLabels;
};

export function FlyToMarkersControl({
  markers,
  pathPoints,
  labels,
}: FlyToMarkersControlProps) {
  const map = useMap();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const isPathMode = pathPoints !== undefined;
  const carIdsKey = markers
    .map((marker) => marker.carId)
    .sort()
    .join(",");
  const pathKey = (pathPoints ?? [])
    .map((point) => `${point.latitude}:${point.longitude}`)
    .join(",");

  useEffect(
    function fitBoundsToMarkers() {
      fitMapToContent(map, { markers, pathPoints });
    },
    // markers/pathPoints are read when their identity keys change; omit from deps on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit on fleet membership or path contents only
    [map, carIdsKey, pathKey, isPathMode],
  );

  useEffect(
    function mountFlyToControl() {
      const control = new L.Control({ position: "topright" });

      control.onAdd = function onAdd() {
        const element = L.DomUtil.create(
          "div",
          "leaflet-control fuel-carrier-fly-to-markers",
        );
        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);
        setContainer(element);
        return element;
      };

      control.onRemove = function onRemove() {
        setContainer(null);
      };

      control.addTo(map);

      return function removeFlyToControl() {
        control.remove();
      };
    },
    [map],
  );

  if (container == null) {
    return null;
  }

  const hasTargets =
    (pathPoints !== undefined && pathPoints.length > 0) || markers.length > 0;

  function handleFlyToMarkers(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    fitMapToContent(map, { markers, pathPoints, animate: true });
  }

  return createPortal(
    <button
      type="button"
      disabled={!hasTargets}
      aria-label={labels.flyToMarkers()}
      title={labels.flyToMarkers()}
      onClick={handleFlyToMarkers}
      className={cn(
        "inline-flex size-11 min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border border-base-content/8 bg-base-200/70 text-base-content shadow-lg backdrop-blur-xl transition-all",
        "hover:bg-base-200/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      <LocateFixed className="size-5" aria-hidden />
    </button>,
    container,
  );
}
