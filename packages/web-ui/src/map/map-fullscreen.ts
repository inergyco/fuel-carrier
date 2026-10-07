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
    void document.exitFullscreen()
    return
  }

  void target.requestFullscreen()
}
