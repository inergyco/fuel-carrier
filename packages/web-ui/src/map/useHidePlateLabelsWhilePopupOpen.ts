import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function useHidePlateLabelsWhilePopupOpen() {
  const map = useMap()

  useEffect(function syncPlateLabelsWithPopup() {
    const container = map.getContainer()

    function hidePlateLabels() {
      container.classList.add('fuel-carrier-plates-hidden')
    }

    function showPlateLabels() {
      container.classList.remove('fuel-carrier-plates-hidden')
    }

    map.on('popupopen', hidePlateLabels)
    map.on('popupclose', showPlateLabels)

    return function stopSyncingPlateLabels() {
      map.off('popupopen', hidePlateLabels)
      map.off('popupclose', showPlateLabels)
      showPlateLabels()
    }
  }, [map])
}
