import type { Map as LeafletMap } from 'leaflet'

export function getFullPageTarget(map: LeafletMap): HTMLElement {
  return map.getContainer().closest('section') ?? map.getContainer()
}

export function isMapFullPage(map: LeafletMap): boolean {
  return document.fullscreenElement === getFullPageTarget(map)
}

export function toggleFullPage(map: LeafletMap): void {
  const target = getFullPageTarget(map)

  if (document.fullscreenElement === target) {
    void document.exitFullscreen().then(function restoreMapFocus() {
      focusMapContainer(map)
    })
    return
  }

  void target.requestFullscreen().then(function restoreMapFocus() {
    focusMapContainer(map)
  })
}

/** Keep focus on the map so fullscreen does not highlight the zoom control. */
function focusMapContainer(map: LeafletMap): void {
  const mapContainer = map.getContainer()
  if (mapContainer.tabIndex < 0) {
    mapContainer.tabIndex = 0
  }
  mapContainer.focus({ preventScroll: true })
}
