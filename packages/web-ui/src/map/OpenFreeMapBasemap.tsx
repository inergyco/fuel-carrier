import './setup-maplibre-worker';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme, type ThemeMode } from '../ui/theme-context';

const OPENFREEMAP_STYLES: Record<ThemeMode, string> = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

export function OpenFreeMapBasemap() {
  const map = useMap();
  const { theme } = useTheme();

  useEffect(
    function mountOpenFreeMapBasemap() {
      const layer = maplibreGL({
        style: OPENFREEMAP_STYLES[theme],
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
