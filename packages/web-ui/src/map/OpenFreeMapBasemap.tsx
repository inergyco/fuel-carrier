import '@maplibre/maplibre-gl-leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme, type ThemeMode } from '../ui/theme-context';

const OPENFREEMAP_STYLES: Record<ThemeMode, string> = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

const BASEMAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://openfreemap.org">OpenFreeMap</a>';

declare module 'leaflet' {
  function maplibreGL(options: {
    style: string;
    attribution?: string;
  }): L.Layer;
}

export function OpenFreeMapBasemap() {
  const map = useMap();
  const { theme } = useTheme();

  useEffect(
    function mountOpenFreeMapBasemap() {
      const layer = L.maplibreGL({
        style: OPENFREEMAP_STYLES[theme],
        attribution: BASEMAP_ATTRIBUTION,
      });
      layer.addTo(map);

      return function cleanupOpenFreeMapBasemap() {
        map.removeLayer(layer);
      };
    },
    [map, theme],
  );

  return null;
}
