import type { Map as LeafletMap } from 'leaflet'
import L from 'leaflet'
import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'
import { Maximize2, Minimize2 } from '../icons'
import { cn } from '../utils'

export type FullPageMapControlLabels = {
  fullPage: () => string
  exitFullPage: () => string
}

type FullPageMapControlProps = {
  labels: FullPageMapControlLabels
}

const getFullPageTarget = (map: LeafletMap): HTMLElement =>
  map.getContainer().closest('section') ?? map.getContainer()

export function FullPageMapControl({ labels }: FullPageMapControlProps) {
  const map = useMap()
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [isFullPage, setIsFullPage] = useState(false)

  useEffect(
    function mountFullPageControl() {
      const control = new L.Control({ position: 'topleft' })

      control.onAdd = function onAdd() {
        const element = L.DomUtil.create(
          'div',
          'leaflet-control fuel-carrier-full-page',
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

      return function removeFullPageControl() {
        control.remove()
      }
    },
    [map],
  )

  useEffect(
    function syncFullPageState() {
      function handleFullscreenChange() {
        setIsFullPage(document.fullscreenElement === getFullPageTarget(map))
        map.invalidateSize()
      }

      document.addEventListener('fullscreenchange', handleFullscreenChange)

      return function removeFullscreenListener() {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
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
    const target = getFullPageTarget(map)

    if (document.fullscreenElement === target) {
      void document.exitFullscreen()
      return
    }

    void target.requestFullscreen()
  }

  return createPortal(
    <button
      type="button"
      aria-label={label}
      aria-pressed={isFullPage}
      title={label}
      onClick={handleToggleFullPage}
      className={cn(
        'inline-flex size-11 min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border border-base-content/8 bg-base-200/70 text-base-content shadow-lg backdrop-blur-xl transition-all',
        'hover:bg-base-200/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>,
    container,
  )
}
