import type { CarTelemetryMarker } from '@fuel-carrier/shared-types';
import { useMemo, type ReactNode } from 'react';
import { MapContainer, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-fix.css';
import { AnimatedCarMarker } from './AnimatedCarMarker';
import { CarMarkerPopup } from './CarMarkerPopup';
import { markerIconForColor } from './car-marker-icon';
import { FitMarkers } from './FitMarkers';
import { DEFAULT_ZOOM, IRAN_CENTER } from './map-constants';
import { OpenFreeMapBasemap } from './OpenFreeMapBasemap';
import { createSmoothedPath, type PathPoint } from './path-smoothing';
import { TrajectoryPathLayer } from './TrajectoryPathLayer';

export type CarsMapLabels = {
  unnamedVehicle: () => string;
  viewVehicle: () => string;
  chooseTimeRange?: () => string;
  remainFuel: (params: { volume: string }) => string;
  resistanceSummary: (params: {
    tankToGround: string;
    tankToNozzle: string;
    groundToVehicle: string;
  }) => string;
};

export type CarsMapProps = {
  markers: CarTelemetryMarker[];
  labels: CarsMapLabels;
  renderVehicleLink: (marker: CarTelemetryMarker) => ReactNode;
  companyColors?: ReadonlyMap<string, string>;
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
  companyColors,
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
    >
      <OpenFreeMapBasemap />
      <FitMarkers markers={markers} pathPoints={pathPoints} />
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
        const companyColor = companyColors?.get(marker.companyId);
        const isSelected = marker.carId === selectedCarId;
        const markerColor = companyColor ?? 'var(--color-primary)';

        return (
          <AnimatedCarMarker
            key={marker.carId}
            position={[marker.latitude, marker.longitude]}
            icon={markerIconForColor(markerColor, isSelected)}
            instant={instantMarkerUpdates}
          >
            <Popup>
              <CarMarkerPopup
                marker={marker}
                title={title}
                labels={labels}
                companyColor={companyColor}
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
