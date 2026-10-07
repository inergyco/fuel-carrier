import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import { Scroll } from "../icons";
import { MapControlButton } from "./MapControlButton";
import { useLeafletControlPortal } from "./useLeafletControlPortal";
import { useMapFullPage } from "./useMapFullPage";
import { usePageCanScroll } from "./usePageCanScroll";

export type ScrollZoomControlLabels = {
  enableScrollZoom: () => string;
  disableScrollZoom: () => string;
};

type ScrollZoomControlProps = {
  labels: ScrollZoomControlLabels;
};

export function ScrollZoomControl({ labels }: ScrollZoomControlProps) {
  const map = useMap();
  const container = useLeafletControlPortal({
    position: "topright",
    className: "fuel-carrier-scroll-zoom",
  });
  const isFullPage = useMapFullPage();
  const pageCanScroll = usePageCanScroll();
  const [isScrollZoomEnabled, setIsScrollZoomEnabled] = useState(false);

  useEffect(
    function syncScrollWheelZoom() {
      const scrollZoom = map.scrollWheelZoom;
      if (scrollZoom == null) {
        return;
      }

      if (isFullPage || !pageCanScroll || isScrollZoomEnabled) {
        scrollZoom.enable();
        return;
      }

      scrollZoom.disable();
    },
    [map, isFullPage, pageCanScroll, isScrollZoomEnabled],
  );

  if (container == null || isFullPage || !pageCanScroll) {
    return null;
  }

  const label = isScrollZoomEnabled
    ? labels.disableScrollZoom()
    : labels.enableScrollZoom();

  function handleToggleScrollZoom(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsScrollZoomEnabled((enabled) => !enabled);
  }

  return createPortal(
    <MapControlButton
      label={label}
      pressed={isScrollZoomEnabled}
      active={isScrollZoomEnabled}
      onClick={handleToggleScrollZoom}
    >
      <Scroll className="size-5" aria-hidden />
    </MapControlButton>,
    container,
  );
}
