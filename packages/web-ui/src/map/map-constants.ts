export const IRAN_CENTER: [number, number] = [32.4279, 53.688];
export const DEFAULT_ZOOM = 5;

type CartoRasterStyle = 'light_all' | 'dark_all';

/** CARTO raster basemaps require ?key= — https://carto.com/basemaps/apikey */
export function cartoRasterTileUrl(style: CartoRasterStyle): string {
  const base = `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png`;
  const key = import.meta.env.VITE_CARTO_API_KEY?.trim();

  if (!key) {
    return base;
  }

  return `${base}?key=${encodeURIComponent(key)}`;
}
