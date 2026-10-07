import L, { type ControlPosition } from 'leaflet'
import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'

type UseLeafletControlPortalOptions = {
  position: ControlPosition
  className: string
}

export function useLeafletControlPortal({
  position,
  className,
}: UseLeafletControlPortalOptions): HTMLDivElement | null {
  const map = useMap()
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(
    function mountLeafletControl() {
      const control = new L.Control({ position })

      control.onAdd = function onAdd() {
        const element = L.DomUtil.create(
          'div',
          `leaflet-control fuel-carrier-map-control ${className}`,
        )
        L.DomEvent.disableClickPropagation(element)
        L.DomEvent.disableScrollPropagation(element)
        setContainer(element)
        return element
      }

      control.onRemove = function onRemove() {
        setContainer(null)
      }

      control.addTo(map)

      return function removeLeafletControl() {
        control.remove()
      }
    },
    [map, position, className],
  )

  return container
}
