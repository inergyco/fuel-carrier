import type { CarTelemetryMarker } from '@fuel-carrier/shared-types';
import { useMemo, type ReactNode } from 'react';
import { MapContainer, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-fix.css';
import { AnimatedCarMarker } from './AnimatedCarMarker';
import { CarMarkerPopup } from './CarMarkerPopup';
import { markerIconForColor } from './car-marker-icon';
import { FlyToMarkersControl } from './FlyToMarkersControl';
import { FullPageMapControl } from './FullPageMapControl';
import { getFuelLevelColor } from './fuel-level';
import { DEFAULT_ZOOM, IRAN_CENTER } from './map-constants';
import { OpenFreeMapBasemap } from './OpenFreeMapBasemap';
import { createSmoothedPath, type PathPoint } from './path-smoothing';
import { TrajectoryPathLayer } from './TrajectoryPathLayer';

export type CarsMapLabels = {
  unnamedVehicle: () => string;
  viewVehicle: () => string;
  chooseTimeRange?: () => string;
  flyToMarkers: () => string;
  fullPage: () => string;
  exitFullPage: () => string;
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

export function CarsMap({
  markers,
  labels,
  renderVehicleLink,
  pathPoints,
  instantMarkerUpdates = false,
  selectedCarId = null,
  onMarkerSelect,
}: CarsMapProps) {
  const smoothedPath = useMemo(
    function buildSmoothedPath() {
      return createSmoothedPath(pathPoints ?? []);
    },
    [pathPoints],
  );

  return (
    <MapContainer
      center={IRAN_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full bg-base-300"
      scrollWheelZoom
      doubleClickZoom={false}
    >
      <OpenFreeMapBasemap />
      <FlyToMarkersControl
        markers={markers}
        pathPoints={pathPoints}
        labels={labels}
      />
      <FullPageMapControl labels={labels} />
      {pathPoints && pathPoints.length > 0 ? (
        <TrajectoryPathLayer
          pathPoints={pathPoints}
          smoothedPath={smoothedPath}
        />
      ) : null}
      {markers.map(function renderMarker(marker) {
        const title = marker.name?.trim()
          ? marker.name
          : labels.unnamedVehicle();
        const isSelected = marker.carId === selectedCarId;
        const markerColor = getFuelLevelColor(marker.remainFuel);

        return (
          <AnimatedCarMarker
            key={marker.carId}
            position={[marker.latitude, marker.longitude]}
            icon={markerIconForColor(markerColor, isSelected)}
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
    </MapContainer>
  );
}
