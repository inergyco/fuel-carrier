import { useId, type ReactNode } from "react";
import { cn } from "../../utils";
import truckArtUrl from "./boniz-500.png";
import { FuelTankBank } from "./FuelTankBank";
import { FuelTankLabels } from "./FuelTankLabels";
import {
  ART_HEIGHT,
  ART_WIDTH,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
  VIEWBOX_X,
  VIEWBOX_Y,
} from "./layout";

export type FuelTruckDiagramProps = {
  capacity: number;
  filled: number[];
  unitLabel?: string;
  className?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function FuelTruckDiagram({
  capacity,
  filled,
  unitLabel,
  className,
  leading,
  trailing,
}: FuelTruckDiagramProps) {
  const reactId = useId().replace(/:/g, "");
  return (
    <figure
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-base-content/8 bg-panel-card p-2 sm:p-4 md:p-5",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -start-20 top-6 size-40 rounded-full bg-primary/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -end-20 bottom-6 size-40 rounded-full bg-primary/12 blur-3xl"
      />

      <div className="relative flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)_minmax(0,11.5rem)] xl:items-center xl:gap-4">
        {leading ? (
          <div className="order-2 xl:order-none">{leading}</div>
        ) : null}
        <div className="order-1 min-w-0 xl:order-none">
          <div dir="ltr" className="relative mx-auto w-full max-w-3xl">
            <div
              className="relative w-full"
              style={{ aspectRatio: `${VIEWBOX_WIDTH} / ${VIEWBOX_HEIGHT}` }}
            >
              <FuelTankLabels filled={filled} unitLabel={unitLabel} />
              <svg
                viewBox={`${VIEWBOX_X} ${VIEWBOX_Y} ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
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
                  x={0}
                  y={0}
                  width={ART_WIDTH}
                  height={ART_HEIGHT}
                  className="pointer-events-none [html[data-theme='dark']_&]:invert [html[data-theme$='-dark']_&]:invert"
                />
              </svg>
            </div>
          </div>
        </div>
        {trailing ? (
          <div className="order-3 xl:order-none">{trailing}</div>
        ) : null}
      </div>
    </figure>
  );
}
