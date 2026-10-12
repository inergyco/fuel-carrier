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
import { DASHBOARD_CAR_CARD_SHELL_CLASS_NAME } from "../ui/dashboard-car-card-shell";
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
      <section className="lg:shrink-0">
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
      <section className="lg:shrink-0">
        <DashboardCarsEmptyState message={labels.carsEmpty()} />
        {carsResult ? (
          <Pagination
            page={carsResult.page}
            totalPages={carsResult.totalPages}
            totalItems={carsResult.totalItems}
            limit={carsResult.limit}
            onPageChange={setPage}
            showLimitSelect={false}
            showWhenEmpty
            labels={LL.common.pagination}
          />
        ) : null}
      </section>
    );
  }

  return (
    <section className="lg:shrink-0">
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
        <DashboardCarsEmptyState message={labels.carsEmptyFiltered()} />
      ) : (
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
      )}

      {carsResult ? (
        <Pagination
          page={carsResult.page}
          totalPages={carsResult.totalPages}
          totalItems={carsResult.totalItems}
          limit={carsResult.limit}
          onPageChange={setPage}
          showLimitSelect={false}
          showWhenEmpty
          labels={LL.common.pagination}
        />
      ) : null}
    </section>
  );
}

function DashboardCarsEmptyState({ message }: { message: string }) {
  return (
    <div
      role="status"
      className={`${DASHBOARD_CAR_CARD_SHELL_CLASS_NAME} w-full !h-auto`}
    >
      {/* Invisible twin of DashboardCarCard so height matches without layout shift. */}
      <div className="invisible select-none" aria-hidden>
        <div className="px-4 pt-4">
          <p className="font-mono text-base font-semibold tracking-tight">
            00الف000
          </p>
          <p className="mt-1 text-sm">Offline</p>
        </div>

        <div className="flex flex-col gap-2.5 px-4 pt-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="size-4 shrink-0" />
            <span>Driver name</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-4 shrink-0" />
            <span>09000000000</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-4 shrink-0" />
            <span>Fuel type</span>
          </div>

          <div className="mt-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span>0 / 0 L</span>
              <span>0%</span>
            </div>
            <div className="h-1.5 w-full rounded-full" />
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 px-4 pb-4 pt-3">
          <div className="h-16 w-28 shrink-0" />
          <div className="h-11 w-24 shrink-0" />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-base-content/55">
        {message}
      </div>
    </div>
  );
}
