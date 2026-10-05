import { useI18nContext } from "@fuel-carrier/i18n/react";
import type {
  CarTelemetryMarker,
  FuelGradeFilter,
  FuelLevelFilter,
} from "@fuel-carrier/shared-types";
import { useState } from "react";
import { useQuery } from "../query";
import {
  DashboardCardsSkeleton,
  normalizeResourceListSearchText,
  Pagination,
  ResourceListToolbar,
  useDebouncedValue,
} from "../ui";
import { DashboardCarCard } from "./car-card";
import type {
  CompanyDashboardDataSource,
  CompanyDashboardLabels,
  CompanyDashboardLinkRenderers,
  CompanyDashboardListParams,
} from "./CompanyDashboard.types";

const DASHBOARD_CARS_PAGE_SIZE = 4;

const CAR_GRID_CLASS_NAME =
  "grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

type DashboardCarsSectionProps = {
  companyId?: string;
  dataSource: CompanyDashboardDataSource;
  enabled?: boolean;
  labels: CompanyDashboardLabels;
  telemetryMarkers: CarTelemetryMarker[];
  renderCarDetailsLink: CompanyDashboardLinkRenderers["renderCarDetailsLink"];
};

export function DashboardCarsSection({
  companyId,
  dataSource,
  enabled = true,
  labels,
  telemetryMarkers,
  renderCarDetailsLink,
}: DashboardCarsSectionProps) {
  const { LL } = useI18nContext();
  const [page, setPage] = useState(1);
  const [draftSearchText, setDraftSearchText] = useState("");
  const [fuelGrade, setFuelGrade] = useState<FuelGradeFilter>("all");
  const [fuelLevel, setFuelLevel] = useState<FuelLevelFilter>("all");
  const debouncedDraftSearchText = useDebouncedValue(draftSearchText);
  const search = normalizeResourceListSearchText(debouncedDraftSearchText);

  const listParams: CompanyDashboardListParams = {
    page,
    limit: DASHBOARD_CARS_PAGE_SIZE,
    search,
    fuelGrade,
    fuelLevel,
    ...(typeof companyId === "string" ? { companyId } : {}),
  };

  const carsQuery = useQuery({
    queryKey: dataSource.carsListKey(listParams),
    queryFn: () => dataSource.fetchCars(listParams),
    enabled,
    placeholderData: (previous) => previous,
  });

  const telemetryByCarId = new Map(
    telemetryMarkers.map((marker) => [marker.carId, marker]),
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
          label={labels.carsLoading()}
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
          {labels.carsEmpty()}
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1">
      <ResourceListToolbar
        className="mb-4 justify-between"
        searchPlaceholder={labels.carsSearchPlaceholder()}
        searchText={draftSearchText}
        onSearchTextChange={handleSearchTextChange}
        fuelGrade={fuelGrade}
        onFuelGradeChange={handleFuelGradeChange}
        fuelLevel={fuelLevel}
        onFuelLevelChange={handleFuelLevelChange}
      />

      {cars.length === 0 ? (
        <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-8 text-center text-sm text-base-content/55 backdrop-blur-xl">
          {labels.carsEmptyFiltered()}
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
                    labels={labels}
                    detailsLink={renderCarDetailsLink(car.id)}
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
