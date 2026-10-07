import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import { isMapFullPage } from './map-fullscreen'

type UseMapFullPageOptions = {
  invalidateSize?: boolean
}

export function useMapFullPage({
  invalidateSize = false,
}: UseMapFullPageOptions = {}): boolean {
  const map = useMap()
  const [isFullPage, setIsFullPage] = useState(() => isMapFullPage(map))

  useEffect(
    function syncFullPageState() {
      function handleFullscreenChange() {
        setIsFullPage(isMapFullPage(map))
        if (invalidateSize) {
          map.invalidateSize()
        }
      }

      handleFullscreenChange()
      document.addEventListener('fullscreenchange', handleFullscreenChange)

      return function removeFullscreenListener() {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
      }
    },
    [map, invalidateSize],
  )

  return isFullPage
}
