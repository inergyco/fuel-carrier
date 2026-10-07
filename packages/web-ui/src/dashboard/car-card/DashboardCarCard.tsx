import type { Car, CarTelemetryMarker } from "@fuel-carrier/shared-types";
import type { ReactNode } from "react";
import { carFuelTypeLabel, formatVolume } from "../../cars";
import type { CompanyDashboardLabels } from "../CompanyDashboard.types";
import { CarCardDetails } from "./CarCardDetails";
import { CarCardFooter } from "./CarCardFooter";
import { CarCardFuelSection } from "./CarCardFuelSection";
import { CarCardHeader } from "./CarCardHeader";
import { CarCardWatermark } from "./CarCardWatermark";
import {
  CAR_CARD_TOTAL_CAPACITY_LITERS,
  getFuelFillPercent,
  getRemainFuelLiters,
} from "./car-card-utils";
import { useCarCardLiveness } from "./useCarCardLiveness";

export type DashboardCarCardProps = {
  car: Car;
  telemetry: CarTelemetryMarker | null;
  labels: CompanyDashboardLabels;
  detailsLink: ReactNode;
};

export function DashboardCarCard({
  car,
  telemetry,
  labels,
  detailsLink,
}: DashboardCarCardProps) {
  const liveness = useCarCardLiveness(telemetry);
  const isLive = liveness === "live";

  const remainFuel = getRemainFuelLiters(telemetry);
  const fillPercent = getFuelFillPercent(remainFuel);

  const statusLabel = isLive ? labels.locationLive() : labels.statusOffline();

  const driverName = car.driver
    ? `${car.driver.firstName} ${car.driver.lastName}`
    : labels.noDriver();

  const mobileNumber =
    car.driver?.mobileNumber?.trim() || labels.mobileUnknown();

  const fuelTypeLabel = carFuelTypeLabel(car.hasHighGrade, labels.fuelType);

  const fuelVolumeLabel =
    remainFuel != null
      ? labels.fuelVolumeOfCapacity({
          volume: formatVolume(remainFuel),
          capacity: formatVolume(CAR_CARD_TOTAL_CAPACITY_LITERS),
          unit: labels.tankUnit(),
        })
      : null;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/15 bg-base-100 shadow-[0_8px_28px_-18px] shadow-base-content/25">
      <CarCardWatermark fillPercent={fillPercent} remainFuel={remainFuel} />

      <CarCardHeader
        licensePlate={car.licensePlate}
        liveness={liveness}
        statusLabel={statusLabel}
      />

      <div className="relative z-10 flex flex-1 flex-col gap-2.5 px-4 pt-3">
        <CarCardDetails
          driverName={driverName}
          mobileNumber={mobileNumber}
          fuelTypeLabel={fuelTypeLabel}
        />
        <CarCardFuelSection
          remainFuel={remainFuel}
          fillPercent={fillPercent}
          remainFuelUnknown={labels.remainFuelUnknown()}
          fuelVolumeLabel={fuelVolumeLabel}
        />
      </div>

      <CarCardFooter detailsLink={detailsLink} />
    </article>
  );
}
