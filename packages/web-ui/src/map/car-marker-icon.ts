import L from 'leaflet';

const markerIconByColor = new Map<string, L.DivIcon>();

type CarMarkerIconOptions = {
  color: string;
  selected?: boolean;
  /** Fresh telemetry. The ring blinks. */
  live?: boolean;
  /** Stale telemetry. The dot and plate render muted. */
  offline?: boolean;
};

function markerIconHtml({
  color,
  selected,
  live,
  offline,
}: {
  color: string;
  selected: boolean;
  live: boolean;
  offline: boolean;
}): string {
  const size = selected ? 18 : 14;
  const ring = selected ? 6 : 4;
  return `<span class="fuel-carrier-marker-dot${markerStateClass({ live, offline })}" style="
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
  offline = false,
}: CarMarkerIconOptions): L.DivIcon {
  const cacheKey = `${color}:${selected ? 'selected' : 'default'}:${markerAppearance({ live, offline })}`;
  const cached = markerIconByColor.get(cacheKey);
  if (cached) {
    return cached;
  }

  const size = selected ? 18 : 14;
  const anchor = selected ? 9 : 7;
  const icon = L.divIcon({
    className: `fuel-carrier-map-marker${offline ? ' is-offline' : ''}`,
    html: markerIconHtml({ color, selected, live, offline }),
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -10],
  });
  markerIconByColor.set(cacheKey, icon);
  return icon;
}

function markerStateClass({
  live,
  offline,
}: {
  live: boolean;
  offline: boolean;
}): string {
  if (live) {
    return ' is-live';
  }

  if (offline) {
    return ' is-offline';
  }

  return '';
}

function markerAppearance({
  live,
  offline,
}: {
  live: boolean;
  offline: boolean;
}): 'live' | 'offline' | 'plain' {
  if (live) {
    return 'live';
  }

  if (offline) {
    return 'offline';
  }

  return 'plain';
}
