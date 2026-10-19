import L from 'leaflet';

const markerIconByColor = new Map<string, L.DivIcon>();

type CarMarkerIconOptions = {
  color: string;
  selected?: boolean;
};

function markerIconHtml(color: string, selected: boolean): string {
  const size = selected ? 18 : 14;
  const ring = selected ? 6 : 4;
  return `<span class="fuel-carrier-marker-dot" style="
    width:${size}px;
    height:${size}px;
    background:${color};
    box-shadow:0 0 0 ${ring}px color-mix(in oklab, ${color} ${selected ? '40%' : '25%'}, transparent);
  "></span>`;
}

export function markerIconForColor({
  color,
  selected = false,
}: CarMarkerIconOptions): L.DivIcon {
  const cacheKey = `${color}:${selected ? 'selected' : 'default'}`;
  const cached = markerIconByColor.get(cacheKey);
  if (cached) {
    return cached;
  }

  const size = selected ? 18 : 14;
  const anchor = selected ? 9 : 7;
  const icon = L.divIcon({
    className: 'fuel-carrier-map-marker',
    html: markerIconHtml(color, selected),
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -10],
  });
  markerIconByColor.set(cacheKey, icon);
  return icon;
}
