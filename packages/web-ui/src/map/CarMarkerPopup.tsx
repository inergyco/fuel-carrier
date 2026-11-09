import type { CarTelemetryMarker } from "@fuel-carrier/shared-types";
import type { ReactNode } from "react";
import { useMap } from "react-leaflet";
import { carFuelTypeLabel } from "../cars/CarOverviewSection";
import { ResistanceValue } from "../cars/ResistanceValue";
import { Button } from "../ui";
import { LicensePlate } from "../ui/license-plate-picker";
import type { CarsMapLabels } from "./CarsMap";
import { useTelemetryLiveness } from "./telemetry-liveness";

export const mapPopupActionClassName =
  "min-w-0 flex-1 whitespace-nowrap px-2 text-center text-xs font-semibold leading-none normal-case tracking-normal no-underline shadow-none";

type CarMarkerPopupProps = {
  marker: CarTelemetryMarker;
  title: string;
  labels: CarsMapLabels;
  renderVehicleLink: (marker: CarTelemetryMarker) => ReactNode;
  onPlanRoute?: (marker: CarTelemetryMarker) => void;
};

export function CarMarkerPopup({
  marker,
  title,
  labels,
  renderVehicleLink,
  onPlanRoute,
}: CarMarkerPopupProps) {
  const planRouteLabel = labels.chooseTimeRange?.();

  return (
    <div className="space-y-2 text-start text-sm text-base-content">
      {marker.licensePlate.trim() ? (
        <LicensePlate value={marker.licensePlate} size="sm" className="mb-0" />
      ) : (
        <p className="font-semibold tracking-tight">{title}</p>
      )}
      {marker.createdAt ? (
        <MarkerLivenessStatus
          ingestedAt={marker.createdAt}
          labels={labels}
        />
      ) : null}
      <p className="text-xs text-base-content/70">
        {labels.fuelType({
          type: carFuelTypeLabel(marker.hasHighGrade ?? false, labels),
        })}
      </p>
      {marker.remainFuel != null ? (
        <p className="text-xs text-base-content/70">
          {labels.remainFuel({ volume: String(marker.remainFuel) })}
        </p>
      ) : null}
      {marker.resistance ? (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium tracking-wider text-base-content/45">
            {labels.resistanceTitle()}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <ResistanceValue value={marker.resistance.tankToGround} compact />
            <span className="text-base-content/30" aria-hidden>
              /
            </span>
            <ResistanceValue value={marker.resistance.tankToNozzle} compact />
            <span className="text-base-content/30" aria-hidden>
              /
            </span>
            <ResistanceValue
              value={marker.resistance.groundToVehicle}
              compact
            />
          </div>
        </div>
      ) : null}
      <div className="flex gap-2 pt-1">
        {renderVehicleLink(marker)}
        {onPlanRoute && planRouteLabel ? (
          <MarkerPlanRouteButton
            label={planRouteLabel}
            onPlanRoute={() => onPlanRoute(marker)}
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

function MarkerLivenessStatus({
  ingestedAt,
  labels,
}: {
  ingestedAt: string;
  labels: CarsMapLabels;
}) {
  const isLive = useTelemetryLiveness(ingestedAt) === "live";

  return (
    <p
      className={`inline-flex items-center gap-1.5 text-xs ${
        isLive ? "text-success" : "text-base-content/55"
      }`}
    >
      <span
        aria-hidden
        className={`size-1.5 shrink-0 rounded-full ${
          isLive ? "bg-success" : "bg-base-content/30"
        }`}
      />
      {isLive ? labels.statusLive() : labels.statusOffline()}
    </p>
  );
}

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
      size="sm"
    >
      {label}
    </Button>
  );
}
