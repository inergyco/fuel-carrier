import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'
import { Hand } from '../icons'
import { MapControlButton } from './MapControlButton'
import { useLeafletControlPortal } from './useLeafletControlPortal'
import { useMapFullPage } from './useMapFullPage'
import { usePageCanScroll } from './usePageCanScroll'

export type ScrollZoomControlLabels = {
  enableScrollZoom: () => string
  disableScrollZoom: () => string
}

type ScrollZoomControlProps = {
  labels: ScrollZoomControlLabels
}

export function ScrollZoomControl({ labels }: ScrollZoomControlProps) {
  const map = useMap()
  const container = useLeafletControlPortal({
    position: 'topright',
    className: 'fuel-carrier-scroll-zoom',
  })
  const isFullPage = useMapFullPage()
  const pageCanScroll = usePageCanScroll()
  const [isMapGestureEnabled, setIsMapGestureEnabled] = useState(false)

  const mapGesturesActive =
    isFullPage || !pageCanScroll || isMapGestureEnabled

  useEffect(
    function syncMapGestureHandlers() {
      const mapContainer = map.getContainer()
      const scrollZoom = map.scrollWheelZoom

      if (mapGesturesActive) {
        scrollZoom?.enable()
        map.dragging.enable()
        map.touchZoom?.enable()
        mapContainer.classList.add('fuel-carrier-map-gestures-active')
        return function restoreDefaultTouchAction() {
          mapContainer.classList.remove('fuel-carrier-map-gestures-active')
        }
      }

      scrollZoom?.disable()
      map.dragging.disable()
      map.touchZoom?.disable()
      mapContainer.classList.remove('fuel-carrier-map-gestures-active')
    },
    [map, mapGesturesActive],
  )

  if (container == null || isFullPage || !pageCanScroll) {
    return null
  }

  const label = isMapGestureEnabled
    ? labels.disableScrollZoom()
    : labels.enableScrollZoom()

  function handleToggleMapGestures(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    setIsMapGestureEnabled((enabled) => !enabled)
  }

  return createPortal(
    <MapControlButton
      label={label}
      pressed={isMapGestureEnabled}
      active={isMapGestureEnabled}
      onClick={handleToggleMapGestures}
    >
      <Hand className="size-5" aria-hidden />
    </MapControlButton>,
    container,
  )
}
