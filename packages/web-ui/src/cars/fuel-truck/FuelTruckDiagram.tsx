import { useId } from "react";
import { cn } from "../../utils";
import truckArtUrl from "./boniz-500.png";
import { FuelTankBank } from "./FuelTankBank";
import { FuelTankLabels } from "./FuelTankLabels";
import { formatVolume, VIEWBOX_HEIGHT, VIEWBOX_WIDTH } from "./layout";

export type FuelTruckDiagramProps = {
  capacity: number;
  filled: number[];
  unitLabel?: string;
  capacityLabel?: string;
  className?: string;
};

export function FuelTruckDiagram({
  capacity,
  filled,
  unitLabel,
  capacityLabel,
  className,
}: FuelTruckDiagramProps) {
  const reactId = useId().replace(/:/g, "");

  const volumeText = `${formatVolume(capacity)}${unitLabel ? ` ${unitLabel}` : ""}`;
  const sharedCapacity = capacityLabel ?? `Capacity per tank: ${volumeText}`;

  return (
    <figure
      dir="ltr"
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-base-content/8 bg-base-100/20 p-2 backdrop-blur-sm sm:p-4 md:p-5",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -start-16 top-0 size-40 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -end-10 bottom-0 size-36 rounded-full bg-primary/10 blur-3xl"
      />

      <p className="relative mb-3 text-center text-xs font-medium tracking-tight tabular-nums text-base-content/55 sm:text-sm">
        {sharedCapacity}
      </p>
      <div className="relative mx-auto w-full max-w-3xl">
        <div
          className="relative w-full"
          style={{ aspectRatio: `${VIEWBOX_WIDTH} / ${VIEWBOX_HEIGHT}` }}
        >
          <FuelTankLabels filled={filled} unitLabel={unitLabel} />
          <svg
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            role="img"
            aria-label="BONIZ 500 fuel carrier side view"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 size-full text-base-content"
          >
            <FuelTankBank
              capacity={capacity}
              filled={filled}
              idPrefix={reactId}
            />
            <image
              href={truckArtUrl}
              width={VIEWBOX_WIDTH}
              height={VIEWBOX_HEIGHT}
              className="pointer-events-none [html[data-theme='dark']_&]:invert [html[data-theme$='-dark']_&]:invert"
            />
          </svg>
        </div>
      </div>
    </figure>
  );
}
