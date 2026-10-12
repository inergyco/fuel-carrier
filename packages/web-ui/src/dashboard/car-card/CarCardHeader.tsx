import { Badge } from "../../ui/Badge";
import { LicensePlate } from "../../ui/license-plate-picker";
import type { CarCardLiveness } from "./car-card-utils";

type CarCardHeaderProps = {
  licensePlate: string;
  liveness: CarCardLiveness;
  statusLabel: string;
  highGradeLabel?: string;
};

export function CarCardHeader({
  licensePlate,
  liveness,
  statusLabel,
  highGradeLabel,
}: CarCardHeaderProps) {
  const isLive = liveness === "live";

  return (
    <div className="relative z-10 px-4 pt-4 flex flex-col gap-2.5">
      <div className="min-w-0 flex justify-between items-start">
        <LicensePlate value={licensePlate} size="sm" />
        {highGradeLabel ? (
          <Badge variant="info" size="md">
            {highGradeLabel}
          </Badge>
        ) : null}
      </div>
      <p
        className={`inline-flex items-center gap-1.5 text-sm ${
          isLive ? "text-success" : "text-base-content/55"
        }`}
      >
        <span
          aria-hidden
          className={`size-2 shrink-0 rounded-full ${
            isLive ? "bg-success" : "bg-base-content/30"
          }`}
        />
        {statusLabel}
      </p>
    </div>
  );
}
