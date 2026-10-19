import type { CarTelemetryMarker } from "@fuel-carrier/shared-types";
import { useMemo, type ReactNode } from "react";
import { MapContainer, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./leaflet-fix.css";
import { LicensePlate } from "../ui/license-plate-picker";
import { AnimatedCarMarker } from "./AnimatedCarMarker";
import { CarMarkerPopup } from "./CarMarkerPopup";
import { FlyToMarkersControl } from "./FlyToMarkersControl";
import { FullPageMapControl } from "./FullPageMapControl";
import { ScrollZoomControl } from "./ScrollZoomControl";
import { getFuelLevelColor } from "./fuel-level";
import { DEFAULT_ZOOM, IRAN_CENTER } from "./map-constants";
import { createSmoothedPath, type PathPoint } from "./path-smoothing";
import { TrajectoryPathLayer } from "./TrajectoryPathLayer";
import { useHidePlateLabelsWhilePopupOpen } from "./useHidePlateLabelsWhilePopupOpen";
import { useOpenFreeMapBasemap } from "./useOpenFreeMapBasemap";

export type CarsMapLabels = {
  unnamedVehicle: () => string;
  viewVehicle: () => string;
  chooseTimeRange?: () => string;
  flyToMarkers: () => string;
  fullPage: () => string;
  exitFullPage: () => string;
  enableScrollZoom: () => string;
  disableScrollZoom: () => string;
  remainFuel: (params: { volume: string }) => string;
  fuelType: (params: { type: string }) => string;
  fuelTypeHighGrade: () => string;
  fuelTypeNormal: () => string;
  resistanceTitle: () => string;
};

export type CarsMapProps = {
  markers: CarTelemetryMarker[];
  labels: CarsMapLabels;
  renderVehicleLink: (marker: CarTelemetryMarker) => ReactNode;
  pathPoints?: readonly CarsMapPathPoint[];
  instantMarkerUpdates?: boolean;
  selectedCarId?: string | null;
  onMarkerSelect?: (marker: CarTelemetryMarker) => void;
};

export type CarsMapPathPoint = PathPoint;

export function CarsMap(props: CarsMapProps) {
  return (
    <MapContainer
      center={IRAN_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full bg-base-300"
      dragging
      touchZoom
      scrollWheelZoom={false}
      doubleClickZoom={false}
    >
      <CarsMapLayers {...props} />
    </MapContainer>
  );
}

function CarsMapLayers({
  markers,
  labels,
  renderVehicleLink,
  pathPoints,
  instantMarkerUpdates = false,
  selectedCarId = null,
  onMarkerSelect,
}: CarsMapProps) {
  useHidePlateLabelsWhilePopupOpen();
  useOpenFreeMapBasemap();

  const smoothedPath = useMemo(
    () => createSmoothedPath(pathPoints ?? []),
    [pathPoints],
  );

  return (
    <>
      <FlyToMarkersControl
        markers={markers}
        pathPoints={pathPoints}
        labels={labels}
      />
      <FullPageMapControl labels={labels} />
      <ScrollZoomControl labels={labels} />
      {pathPoints && pathPoints.length > 0 ? (
        <TrajectoryPathLayer
          pathPoints={pathPoints}
          smoothedPath={smoothedPath}
        />
      ) : null}
      {markers.map(function renderMarker(marker) {
        const title = marker.licensePlate.trim()
          ? marker.licensePlate
          : labels.unnamedVehicle();
        const isSelected = marker.carId === selectedCarId;
        const markerColor = getFuelLevelColor(marker.remainFuel);

        return (
          <AnimatedCarMarker
            key={marker.carId}
            position={[marker.latitude, marker.longitude]}
            color={markerColor}
            selected={isSelected}
            plateLabel={
              marker.licensePlate.trim() ? (
                <LicensePlate
                  value={marker.licensePlate}
                  size="sm"
                  className="max-w-none bg-base-100"
                />
              ) : null
            }
            instant={instantMarkerUpdates}
          >
            <Popup className="w-60">
              <CarMarkerPopup
                marker={marker}
                title={title}
                labels={labels}
                renderVehicleLink={renderVehicleLink}
                onPlanRoute={onMarkerSelect}
              />
            </Popup>
          </AnimatedCarMarker>
        );
      })}
    </>
  );
}
