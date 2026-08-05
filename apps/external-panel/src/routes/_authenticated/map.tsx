import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import type { CarLocationMarker } from "@fuel-carrier/shared-types";
import { FleetMapView } from "@fuel-carrier/web-ui/map";
import { useCarLocationsLive } from "../../components/map/useCarLocationsLive";

export const Route = createFileRoute("/_authenticated/map")({
  component: MapPage,
});

function MapPage() {
  const { LL } = useI18nContext();
  const locationsQuery = useCarLocationsLive();

  function renderVehicleLink(marker: CarLocationMarker) {
    return (
      <Link
        to="/cars/$carId"
        params={{ carId: marker.carId }}
        className="inline-flex text-xs font-medium text-primary hover:underline"
      >
        {LL.externalPanel.map.viewVehicle()}
      </Link>
    );
  }

  return (
    <FleetMapView
      markers={locationsQuery.data ?? []}
      isLoading={locationsQuery.isLoading}
      labels={LL.externalPanel.map}
      renderVehicleLink={renderVehicleLink}
    />
  );
}
