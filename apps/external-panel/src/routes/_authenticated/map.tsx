import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import type { CarTelemetryMarker } from "@fuel-carrier/shared-types";
import { api } from "@fuel-carrier/web-ui/api";
import {
  mapPopupActionClassName,
  TrajectoryMapView,
  useCarTelemetryLive,
} from "@fuel-carrier/web-ui/map";
import { buttonClassName } from "@fuel-carrier/web-ui/ui";
import { cn } from "@fuel-carrier/web-ui/utils";
import { useQuery } from "@fuel-carrier/web-ui/query";
import { carKeys, fetchCars } from "../../lib/api/cars";

export const Route = createFileRoute("/_authenticated/map")({
  component: MapPage,
});

function MapPage() {
  const { LL } = useI18nContext();
  const telemetryQuery = useCarTelemetryLive(api);
  const carsQuery = useQuery({
    queryKey: carKeys.all,
    queryFn: fetchCars,
  });

  function renderVehicleLink(marker: CarTelemetryMarker) {
    return (
      <Link
        to="/cars/$carId"
        params={{ carId: marker.carId }}
        className={cn(buttonClassName.outline, mapPopupActionClassName)}
      >
        {LL.externalPanel.map.viewVehicle()}
      </Link>
    );
  }

  return (
    <TrajectoryMapView
      api={api}
      cars={carsQuery.data ?? []}
      markers={telemetryQuery.data ?? []}
      isLoading={telemetryQuery.isLoading}
      labels={LL.externalPanel.map}
      renderVehicleLink={renderVehicleLink}
    />
  );
}
