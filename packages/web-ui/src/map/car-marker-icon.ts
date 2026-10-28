import L from 'leaflet';

const markerIconByColor = new Map<string, L.DivIcon>();

type CarMarkerIconOptions = {
  color: string;
  selected?: boolean;
  /** Fresh telemetry. The ring blinks; offline markers have no ring. */
  live?: boolean;
};

function markerIconHtml({
  color,
  selected,
  live,
}: {
  color: string;
  selected: boolean;
  live: boolean;
}): string {
  const size = selected ? 18 : 14;
  const ring = selected ? 6 : 4;
  return `<span class="fuel-carrier-marker-dot${live ? ' is-live' : ''}" style="
    width:${size}px;
    height:${size}px;
    background:${color};
    --marker-ring:${ring}px;
    --marker-color:${color};
  "><span class="fuel-carrier-marker-ring" aria-hidden="true"></span></span>`;
}

export function markerIconForColor({
  color,
  selected = false,
  live = false,
}: CarMarkerIconOptions): L.DivIcon {
  const cacheKey = `${color}:${selected ? 'selected' : 'default'}:${live ? 'live' : 'offline'}`;
  const cached = markerIconByColor.get(cacheKey);
  if (cached) {
    return cached;
  }

  const size = selected ? 18 : 14;
  const anchor = selected ? 9 : 7;
  const icon = L.divIcon({
    className: 'fuel-carrier-map-marker',
    html: markerIconHtml({ color, selected, live }),
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -10],
  });
  markerIconByColor.set(cacheKey, icon);
  return icon;
}
