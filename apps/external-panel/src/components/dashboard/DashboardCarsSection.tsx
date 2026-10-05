import { useI18nContext } from "@fuel-carrier/i18n/react";
import type {
  CarTelemetryMarker,
  FuelGradeFilter,
  FuelLevelFilter,
  ResourceListParams,
} from "@fuel-carrier/shared-types";
import {
  DashboardCardsSkeleton,
  normalizeResourceListSearchText,
  Pagination,
  ResourceListToolbar,
  useDebouncedValue,
} from "@fuel-carrier/web-ui/ui";
import { useQuery } from "@fuel-carrier/web-ui/query";
import { useMemo, useState } from "react";
import { carKeys, fetchCars } from "../../lib/api/cars";
import { DashboardCarCard } from "./car-card";

const DASHBOARD_CARS_PAGE_SIZE = 4;

const CAR_GRID_CLASS_NAME =
  "grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

type DashboardCarsSectionProps = {
  telemetryMarkers: CarTelemetryMarker[];
};

export function DashboardCarsSection({
  telemetryMarkers,
}: DashboardCarsSectionProps) {
  const { LL } = useI18nContext();
  const [page, setPage] = useState(1);
  const [draftSearchText, setDraftSearchText] = useState("");
  const [fuelGrade, setFuelGrade] = useState<FuelGradeFilter>("all");
  const [fuelLevel, setFuelLevel] = useState<FuelLevelFilter>("all");
  const debouncedDraftSearchText = useDebouncedValue(draftSearchText);
  const search = normalizeResourceListSearchText(debouncedDraftSearchText);

  const listParams: ResourceListParams = {
    page,
    limit: DASHBOARD_CARS_PAGE_SIZE,
    search,
    fuelGrade,
    fuelLevel,
  };

  const carsQuery = useQuery({
    queryKey: carKeys.list(listParams),
    queryFn: () => fetchCars(listParams),
    placeholderData: (previous) => previous,
  });

  const telemetryByCarId = useMemo(
    function mapTelemetry() {
      return new Map(
        telemetryMarkers.map(function toTelemetryEntry(marker) {
          return [marker.carId, marker];
        }),
      );
    },
    [telemetryMarkers],
  );

  const carsResult = carsQuery.data;
  const cars = carsResult?.items ?? [];
  const totalItems = carsResult?.totalItems ?? 0;
  const isCarsLoading = carsQuery.isLoading && !carsResult;
  const hasActiveFilters =
    Boolean(search) || fuelGrade !== "all" || fuelLevel !== "all";

  function handleSearchTextChange(nextSearchText: string) {
    setDraftSearchText(nextSearchText);
    setPage(1);
  }

  function handleFuelGradeChange(nextFuelGrade: FuelGradeFilter) {
    setFuelGrade(nextFuelGrade);
    setPage(1);
  }

  function handleFuelLevelChange(nextFuelLevel: FuelLevelFilter) {
    setFuelLevel(nextFuelLevel);
    setPage(1);
  }

  if (isCarsLoading) {
    return (
      <section className="flex-1">
        <DashboardCardsSkeleton
          label={LL.externalPanel.cars.loading()}
          variant="car"
          count={DASHBOARD_CARS_PAGE_SIZE}
          showPagination
          columnsClassName={CAR_GRID_CLASS_NAME}
        />
      </section>
    );
  }

  if (totalItems === 0 && !hasActiveFilters) {
    return (
      <section className="flex-1">
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
          {LL.externalPanel.cars.empty()}
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1">
      <ResourceListToolbar
        searchPlaceholder={LL.externalPanel.cars.searchPlaceholder()}
        searchText={draftSearchText}
        onSearchTextChange={handleSearchTextChange}
        fuelGrade={fuelGrade}
        onFuelGradeChange={handleFuelGradeChange}
        fuelLevel={fuelLevel}
        onFuelLevelChange={handleFuelLevelChange}
      />

      {cars.length === 0 ? (
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
          {LL.externalPanel.cars.emptyFiltered()}
        </div>
      ) : (
        <>
          <ul className={`grid ${CAR_GRID_CLASS_NAME}`}>
            {cars.map(function renderCarCard(car) {
              return (
                <li key={car.id}>
                  <DashboardCarCard
                    car={car}
                    telemetry={telemetryByCarId.get(car.id) ?? null}
                  />
                </li>
              );
            })}
          </ul>
          {carsResult ? (
            <Pagination
              page={carsResult.page}
              totalPages={carsResult.totalPages}
              totalItems={carsResult.totalItems}
              limit={carsResult.limit}
              onPageChange={setPage}
              showLimitSelect={false}
              labels={LL.common.pagination}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
