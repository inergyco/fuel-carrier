import { useEffect, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'
import { Maximize2, Minimize2 } from '../icons'
import { MapControlButton } from './MapControlButton'
import { toggleFullPage } from './map-fullscreen'
import { useLeafletControlPortal } from './useLeafletControlPortal'
import { useMapFullPage } from './useMapFullPage'

export type FullPageMapControlLabels = {
  fullPage: () => string
  exitFullPage: () => string
}

type FullPageMapControlProps = {
  labels: FullPageMapControlLabels
}

export function FullPageMapControl({ labels }: FullPageMapControlProps) {
  const map = useMap()
  const container = useLeafletControlPortal({
    position: 'topleft',
    className: 'fuel-carrier-full-page',
  })
  const isFullPage = useMapFullPage({ invalidateSize: true })

  useEffect(
    function toggleFullPageOnDoubleClick() {
      function handleDoubleClick() {
        toggleFullPage(map)
      }

      map.doubleClickZoom?.disable()
      map.on('dblclick', handleDoubleClick)

      return function removeDoubleClickListener() {
        map.off('dblclick', handleDoubleClick)
      }
    },
    [map],
  )

  if (container == null) {
    return null
  }

  const label = isFullPage ? labels.exitFullPage() : labels.fullPage()
  const Icon = isFullPage ? Minimize2 : Maximize2

  function handleToggleFullPage(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    toggleFullPage(map)
  }

  return createPortal(
    <MapControlButton
      label={label}
      pressed={isFullPage}
      onClick={handleToggleFullPage}
    >
      <Icon className="size-5" aria-hidden />
    </MapControlButton>,
    container,
  )
}
