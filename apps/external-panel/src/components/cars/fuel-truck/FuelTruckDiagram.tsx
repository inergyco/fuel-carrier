import { useId } from "react";
import { cn } from "@fuel-carrier/web-ui/utils";
import { FuelTankBank } from "./FuelTankBank";
import { FuelTankLabels } from "./FuelTankLabels";
import { FuelTruckGradients } from "./FuelTruckGradients";
import { TruckBody } from "./TruckBody";
import { TruckCab } from "./TruckCab";
import { TruckChassis } from "./TruckChassis";
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
  const chassisGradientId = `${reactId}-chassis`;

  const volumeText = `${formatVolume(capacity)}${unitLabel ? ` ${unitLabel}` : ""}`;
  const sharedCapacity = capacityLabel ?? `Capacity per tank: ${volumeText}`;

  return (
    <figure
      dir="ltr"
      className={cn(
        "relative w-full rounded-2xl border border-base-content/8 bg-base-100/20 p-2 backdrop-blur-sm sm:p-4 md:p-5",
        className,
      )}
    >
      <p className="mb-3 text-center text-xs font-medium tabular-nums text-base-content/55 sm:text-sm">
        {sharedCapacity}
      </p>
      <div className="mx-auto w-full max-w-3xl">
        <div
          className="relative w-full"
          style={{ aspectRatio: `${VIEWBOX_WIDTH} / ${VIEWBOX_HEIGHT}` }}
        >
          <FuelTankLabels filled={filled} unitLabel={unitLabel} />
          <svg
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            role="img"
            aria-label="Fuel carrier truck side view"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 size-full text-base-content"
          >
            <defs>
              <FuelTruckGradients chassisGradientId={chassisGradientId} />
            </defs>

            <TruckChassis chassisGradientId={chassisGradientId} />
            <TruckCab />
            <TruckBody />
            <FuelTankBank
              capacity={capacity}
              filled={filled}
              idPrefix={reactId}
            />
          </svg>
        </div>
      </div>
    </figure>
  );
}
