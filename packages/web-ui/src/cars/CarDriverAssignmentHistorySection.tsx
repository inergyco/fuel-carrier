import { DEFAULT_LIMIT } from "@fuel-carrier/shared-types";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import { useState } from "react";
import {
  carDriverAssignmentKeys,
  fetchCarDriverAssignments,
} from "./car-driver-assignments";
import { useQuery } from "../query";
import { Pagination } from "../ui/Pagination";
import { cn } from "../utils";

export type CarDriverAssignmentHistoryLabelScope = "external" | "internal";

export type CarDriverAssignmentHistorySectionProps = {
  carId: string;
  labelScope: CarDriverAssignmentHistoryLabelScope;
};

export function CarDriverAssignmentHistorySection({
  carId,
  labelScope,
}: CarDriverAssignmentHistorySectionProps) {
  const { LL, locale } = useI18nContext();
  const carLabels =
    labelScope === "external"
      ? LL.externalPanel.cars
      : LL.internalPanel.companies.detail;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const pagination = { page, limit };
  const assignmentsQuery = useQuery({
    queryKey: carDriverAssignmentKeys.byCar(carId, pagination),
    queryFn: function loadAssignments() {
      return fetchCarDriverAssignments(carId, pagination);
    },
    placeholderData: (previousData) => previousData,
  });
  const result = assignmentsQuery.data;

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  function handleLimitChange(nextLimit: number) {
    setLimit(nextLimit);
    setPage(1);
  }

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-5 backdrop-blur-sm md:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {carLabels.driverAssignmentHistoryTitle()}
        </h2>
        <p className="text-sm text-base-content/50">
          {carLabels.driverAssignmentHistorySubtitle()}
        </p>
      </div>

      {assignmentsQuery.isLoading && !result ? (
        <p className="text-sm text-base-content/50">
          {carLabels.driverAssignmentHistoryLoading()}
        </p>
      ) : (result?.items.length ?? 0) === 0 ? (
        <p className="text-sm text-base-content/50">
          {carLabels.driverAssignmentHistoryEmpty()}
        </p>
      ) : (
        <div
          className={
            assignmentsQuery.isFetching
              ? "opacity-60 transition-opacity"
              : undefined
          }
        >
          <ol className="relative flex flex-col gap-3">
            {result?.items.map(function renderAssignment(item, index) {
              const isCurrent = item.unassignedAt == null;
              const isLast = index === (result?.items.length ?? 0) - 1;

              return (
                <li key={item.id} className="relative flex gap-3 sm:gap-4">
                  {!isLast ? (
                    <span
                      aria-hidden
                      className="absolute start-[0.6875rem] top-6 bottom-[-0.75rem] w-px bg-base-content/10"
                    />
                  ) : null}

                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 mt-5 size-3.5 shrink-0 rounded-full border",
                      isCurrent
                        ? "border-primary/60 bg-primary/30 shadow-[0_0_12px] shadow-primary/20"
                        : "border-base-content/15 bg-base-200/80",
                    )}
                  />

                  <div className="min-w-0 flex-1 rounded-xl border border-base-content/6 bg-base-100/20 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium tracking-tight">
                        {formatPersonName(
                          item.driver,
                          carLabels.driverAssignmentHistoryUnknownDriver(),
                        )}
                      </p>
                      {isCurrent ? (
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {carLabels.driverAssignmentHistoryCurrent()}
                        </span>
                      ) : null}
                    </div>

                    <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-base-content/45">
                          {carLabels.driverAssignmentHistoryAssignedAt()}
                        </dt>
                        <dd className="mt-1 text-base-content/80">
                          {formatAssignmentTimestamp(item.assignedAt, locale)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-base-content/45">
                          {carLabels.driverAssignmentHistoryUnassignedAt()}
                        </dt>
                        <dd className="mt-1 text-base-content/80">
                          {item.unassignedAt
                            ? formatAssignmentTimestamp(
                                item.unassignedAt,
                                locale,
                              )
                            : carLabels.driverAssignmentHistoryOpenEnded()}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-base-content/45">
                          {carLabels.driverAssignmentHistoryAssignedBy()}
                        </dt>
                        <dd className="mt-1 text-base-content/80">
                          {formatPersonName(
                            item.assignedBy,
                            carLabels.driverAssignmentHistoryUnknownAssigner(),
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </li>
              );
            })}
          </ol>

          {result ? (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              totalItems={result.totalItems}
              limit={result.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              labels={LL.common.pagination}
              className="mt-5 pt-5"
            />
          ) : null}
        </div>
      )}
    </section>
  );
}

function formatAssignmentTimestamp(
  value: Date | string,
  locale: string,
): string {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatPersonName(
  person: { firstName: string; lastName: string } | null,
  unknownLabel: string,
): string {
  if (!person) {
    return unknownLabel;
  }

  return `${person.firstName} ${person.lastName}`.trim();
}
