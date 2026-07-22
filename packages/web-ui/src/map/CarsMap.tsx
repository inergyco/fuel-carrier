import type { CarLocationMarker } from "@fuel-carrier/shared-types";
import L from "leaflet";
import { useEffect, type ReactNode } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./leaflet-fix.css";
import { useTheme, type ThemeMode } from "../ui/theme-context";

const IRAN_CENTER: [number, number] = [32.4279, 53.688];
const DEFAULT_ZOOM = 5;

const TILE_URLS: Record<ThemeMode, string> = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

const markerIcon = L.divIcon({
  className: "fuel-carrier-map-marker",
  html: `<span style="
    display:block;
    width:14px;
    height:14px;
    border-radius:9999px;
    background:var(--color-primary);
    border:2px solid var(--color-base-100);
    box-shadow:0 0 0 4px color-mix(in oklab, var(--color-primary) 25%, transparent);
  "></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

export type CarsMapLabels = {
  unnamedVehicle: () => string;
  viewVehicle: () => string;
};

export type CarsMapProps = {
  markers: CarLocationMarker[];
  labels: CarsMapLabels;
  renderVehicleLink: (marker: CarLocationMarker) => ReactNode;
};

export function CarsMap({ markers, labels, renderVehicleLink }: CarsMapProps) {
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

        return (
          <Marker
            key={marker.carId}
            position={[marker.latitude, marker.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <div className="space-y-1.5 text-sm text-base-content">
                <p className="font-semibold tracking-tight">{title}</p>
                <p className="font-mono text-xs text-base-content/60">
                  {marker.licensePlate}
                </p>
                {renderVehicleLink(marker)}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

function FitMarkers({ markers }: { markers: CarLocationMarker[] }) {
  const map = useMap();

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
    [map, markers],
  );

  return null;
}
