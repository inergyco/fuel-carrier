import type { CarTelemetryMarker } from '@fuel-carrier/shared-types';
import type { ReactNode } from 'react';
import { useMap } from 'react-leaflet';
import { Button } from '../ui';
import type { CarsMapLabels } from './CarsMap';
import { mapPopupActionClassName } from './map-popup-actions';

type CarMarkerPopupProps = {
  marker: CarTelemetryMarker;
  title: string;
  labels: CarsMapLabels;
  companyColor?: string;
  renderVehicleLink: (marker: CarTelemetryMarker) => ReactNode;
  onPlanRoute?: (marker: CarTelemetryMarker) => void;
};

export function CarMarkerPopup({
  marker,
  title,
  labels,
  companyColor,
  renderVehicleLink,
  onPlanRoute,
}: CarMarkerPopupProps) {
  const planRouteLabel = labels.chooseTimeRange?.();

  return (
    <div className="space-y-2 text-start text-sm text-base-content">
      <p className="font-semibold tracking-tight">{title}</p>
      <p className="font-mono text-xs text-base-content/60">
        {marker.licensePlate}
      </p>
      {marker.companyName ? (
        <p className="flex items-center gap-2 text-xs text-base-content/55">
          {companyColor ? (
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: companyColor }}
              aria-hidden
            />
          ) : null}
          {marker.companyName}
        </p>
      ) : null}
      {marker.remainFuel != null ? (
        <p className="text-xs text-base-content/70">
          {labels.remainFuel({ volume: String(marker.remainFuel) })}
        </p>
      ) : null}
      {marker.resistance ? (
        <p className="text-xs text-base-content/70">
          {labels.resistanceSummary({
            tankToGround: String(marker.resistance.tankToGround),
            tankToNozzle: String(marker.resistance.tankToNozzle),
            groundToVehicle: String(marker.resistance.groundToVehicle),
          })}
        </p>
      ) : null}
      <div className="flex gap-2 pt-1">
        {renderVehicleLink(marker)}
        {onPlanRoute && planRouteLabel ? (
          <MarkerPlanRouteButton
            label={planRouteLabel}
            onPlanRoute={function handlePlanRouteFromPopup() {
              onPlanRoute(marker);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

type MarkerPlanRouteButtonProps = {
  label: string;
  onPlanRoute: () => void;
};

function MarkerPlanRouteButton({
  label,
  onPlanRoute,
}: MarkerPlanRouteButtonProps) {
  const map = useMap();

  function handleClick() {
    map.closePopup();
    onPlanRoute();
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      className={mapPopupActionClassName}
    >
      {label}
    </Button>
  );
}
