import type { CarTelemetryMarker } from "@fuel-carrier/shared-types";
import L, { type Marker as LeafletMarker } from "leaflet";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./leaflet-fix.css";
import { useTheme, type ThemeMode } from "../ui/theme-context";
import { animateLeafletMarkerTo } from "./animate-marker-position";

const IRAN_CENTER: [number, number] = [32.4279, 53.688];
const DEFAULT_ZOOM = 5;

const TILE_URLS: Record<ThemeMode, string> = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

const markerIcon = L.divIcon({
  className: "fuel-carrier-map-marker",
  html: markerIconHtml("var(--color-primary)"),
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

const markerIconByColor = new Map<string, L.DivIcon>();

function markerIconHtml(color: string): string {
  return `<span style="
    display:block;
    width:14px;
    height:14px;
    border-radius:9999px;
    background:${color};
    border:2px solid var(--color-base-100);
    box-shadow:0 0 0 4px color-mix(in oklab, ${color} 25%, transparent);
  "></span>`;
}

function markerIconForColor(color: string): L.DivIcon {
  const cached = markerIconByColor.get(color);
  if (cached) {
    return cached;
  }

  const icon = L.divIcon({
    className: "fuel-carrier-map-marker",
    html: markerIconHtml(color),
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
  markerIconByColor.set(color, icon);
  return icon;
}

export type CarsMapLabels = {
  unnamedVehicle: () => string;
  viewVehicle: () => string;
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
};

export function CarsMap({
  markers,
  labels,
  renderVehicleLink,
  companyColors,
}: CarsMapProps) {
  const { theme } = useTheme();

  return (
    <MapContainer
      center={IRAN_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full bg-base-300"
      scrollWheelZoom
    >
      <TileLayer
        key={theme}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={TILE_URLS[theme]}
      />
      <FitMarkers markers={markers} />
      {markers.map(function renderMarker(marker) {
        const title = marker.name?.trim()
          ? marker.name
          : labels.unnamedVehicle();
        const companyColor = companyColors?.get(marker.companyId);
        const icon = companyColor
          ? markerIconForColor(companyColor)
          : markerIcon;

        return (
          <AnimatedCarMarker
            key={marker.carId}
            position={[marker.latitude, marker.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="space-y-1.5 text-sm text-base-content">
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
                    {labels.remainFuel({
                      volume: String(marker.remainFuel),
                    })}
                  </p>
                ) : null}
                {marker.resistance ? (
                  <p className="text-xs text-base-content/70">
                    {labels.resistanceSummary({
                      tankToGround: String(marker.resistance.tankToGround),
                      tankToNozzle: String(marker.resistance.tankToNozzle),
                      groundToVehicle: String(
                        marker.resistance.groundToVehicle,
                      ),
                    })}
                  </p>
                ) : null}
                {renderVehicleLink(marker)}
              </div>
            </Popup>
          </AnimatedCarMarker>
        );
      })}
    </MapContainer>
  );
}

type AnimatedCarMarkerProps = {
  position: [number, number];
  icon: L.DivIcon;
  children: ReactNode;
};

/**
 * Keeps the React-Leaflet position prop stable and animates via Leaflet
 * `setLatLng` so live GPS updates glide instead of teleporting.
 */
function AnimatedCarMarker({
  position,
  icon,
  children,
}: AnimatedCarMarkerProps) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const [initialPosition] = useState(position);
  const endLat = position[0];
  const endLng = position[1];

  useEffect(
    function animateToTarget() {
      const maybeMarker = markerRef.current;
      if (maybeMarker == null) {
        return;
      }

      const cancel = animateLeafletMarkerTo(maybeMarker, endLat, endLng);
      return cancel ?? undefined;
    },
    [endLat, endLng],
  );

  return (
    <Marker ref={markerRef} position={initialPosition} icon={icon}>
      {children}
    </Marker>
  );
}

function FitMarkers({ markers }: { markers: CarTelemetryMarker[] }) {
  const map = useMap();
  // Re-fit only when the set of cars changes — not on every live position update.
  const carIdsKey = markers
    .map(function toCarId(marker) {
      return marker.carId;
    })
    .sort()
    .join(",");

  useEffect(
    function fitBoundsToMarkers() {
      if (markers.length === 0) {
        map.setView(IRAN_CENTER, DEFAULT_ZOOM);
        return;
      }

      if (markers.length === 1) {
        map.setView([markers[0].latitude, markers[0].longitude], 12);
        return;
      }

      const bounds = L.latLngBounds(
        markers.map(function toLatLng(marker) {
          return [marker.latitude, marker.longitude] as [number, number];
        }),
      );
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    },
    // markers is read when carIdsKey changes (same render); omit from deps on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit on fleet membership only
    [map, carIdsKey],
  );

  return null;
}
