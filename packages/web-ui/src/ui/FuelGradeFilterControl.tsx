import type { FuelGradeFilter } from "@fuel-carrier/shared-types";
import { FUEL_GRADE_FILTERS } from "@fuel-carrier/shared-types";
import { cn } from "../utils";
import { Button } from "./Button";

export type FuelGradeFilterLabels = {
  all: () => string;
  highGrade: () => string;
  normal: () => string;
  filterLabel: () => string;
};

export type FuelGradeFilterProps = {
  value: FuelGradeFilter;
  onChange: (fuelGrade: FuelGradeFilter) => void;
  labels: FuelGradeFilterLabels;
  className?: string;
};

export function FuelGradeFilterControl({
  value,
  onChange,
  labels,
  className,
}: FuelGradeFilterProps) {
  return (
    <div
      role="group"
      aria-label={labels.filterLabel()}
      className={cn(
        "grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap",
        className,
      )}
    >
      {FUEL_GRADE_FILTERS.map(function renderFuelGradeOption(option) {
        const isActive = value === option;

        return (
          <Button
            key={option}
            type="button"
            variant={isActive ? "primary" : "ghost"}
            className={cn(
              "h-11 min-h-11 w-full px-3 normal-case tracking-normal sm:w-auto sm:px-4",
              !isActive &&
                "border border-base-content/12 bg-base-100/45 text-base-content/70",
            )}
            aria-pressed={isActive}
            onClick={function handleFuelGradeClick() {
              onChange(option);
            }}
          >
            {fuelGradeLabel(option, labels)}
          </Button>
        );
      })}
    </div>
  );
}

function fuelGradeLabel(
  option: FuelGradeFilter,
  labels: FuelGradeFilterLabels,
): string {
  if (option === "highGrade") {
    return labels.highGrade();
  }

  if (option === "normal") {
    return labels.normal();
  }

  return labels.all();
}
