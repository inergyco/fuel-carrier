import type {
  Car,
  CarTelemetryMarker,
  Driver,
} from "@fuel-carrier/shared-types";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import {
  DEFAULT_TANK_CAPACITY_LITERS,
  DEFAULT_TANK_COUNT,
  formatVolume,
} from "@fuel-carrier/web-ui/cars";
import { ICON_STROKE_WIDTH } from "@fuel-carrier/web-ui/ui";
import { Info, MapPin, Phone, User } from "@fuel-carrier/web-ui/icons";
import { Link } from "@tanstack/react-router";

const MOVING_SPEED_KMH = 1;

/** Matches the tanks diagram on the vehicle detail page. */
const TOTAL_CAPACITY_LITERS = DEFAULT_TANK_CAPACITY_LITERS * DEFAULT_TANK_COUNT;

export type DashboardCarCardProps = {
  car: Car;
  driver: Driver | null;
  telemetry: CarTelemetryMarker | null;
};

export function DashboardCarCard({
  car,
  driver,
  telemetry,
}: DashboardCarCardProps) {
  const { LL } = useI18nContext();

  const isLive = telemetry != null;
  const isMoving =
    isLive && telemetry.speed != null && telemetry.speed > MOVING_SPEED_KMH;

  const remainFuel =
    telemetry?.remainFuel != null && Number.isFinite(telemetry.remainFuel)
      ? Math.max(0, telemetry.remainFuel)
      : null;

  const fillPercent =
    remainFuel != null
      ? Math.min(100, Math.round((remainFuel / TOTAL_CAPACITY_LITERS) * 100))
      : null;

  const statusLabel = !isLive
    ? LL.externalPanel.home.locationUnknown()
    : isMoving
      ? LL.externalPanel.home.statusMoving()
      : LL.externalPanel.home.statusStopped();

  const statusDotClass = !isLive
    ? "bg-base-content/30"
    : isMoving
      ? "bg-success"
      : "bg-warning";

  const driverName = driver
    ? `${driver.firstName} ${driver.lastName}`
    : LL.externalPanel.cars.noDriver();

  const mobileNumber = driver?.mobileNumber?.trim() || null;
  const locationLabel = isLive
    ? LL.externalPanel.home.locationLive()
    : LL.externalPanel.home.locationUnknown();

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-primary/15 bg-base-100 shadow-[0_8px_28px_-18px] shadow-base-content/25">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-base font-semibold tracking-tight text-base-content">
            {car.licensePlate}
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-base-content/55">
            <span
              aria-hidden
              className={`size-2 shrink-0 rounded-full ${statusDotClass}`}
            />
            {statusLabel}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4 pt-3 text-sm text-base-content/60">
        <div className="flex min-w-0 items-center gap-2">
          <User
            className="size-4 shrink-0 text-base-content/40"
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          <span className="truncate font-medium text-base-content/75">
            {driverName}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2" dir="ltr">
          <Phone
            className="size-4 shrink-0 text-base-content/40"
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          <span className="truncate font-mono tabular-nums">
            {mobileNumber ?? LL.externalPanel.home.mobileUnknown()}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <MapPin
            className="size-4 shrink-0 text-base-content/40"
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          <span className="truncate">{locationLabel}</span>
        </div>

        <div className="mt-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
            <span>
              {remainFuel != null
                ? LL.externalPanel.home.fuelVolumeOfCapacity({
                    volume: formatVolume(remainFuel),
                    capacity: formatVolume(TOTAL_CAPACITY_LITERS),
                    unit: LL.externalPanel.cars.tankUnit(),
                  })
                : LL.externalPanel.cars.remainFuelUnknown()}
            </span>
            {fillPercent != null ? <span>{fillPercent}%</span> : null}
          </div>
          {remainFuel != null ? (
            <div
              className="h-1.5 overflow-hidden rounded-full bg-base-content/8"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={TOTAL_CAPACITY_LITERS}
              aria-valuenow={remainFuel}
            >
              <div
                className="h-full rounded-full bg-success transition-[width] duration-500"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          ) : (
            <div className="h-1.5 rounded-full bg-base-content/8" aria-hidden />
          )}
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 px-4 pb-4 pt-3">
        <div className="relative h-16 w-28 shrink-0">
          <img
            src="/truck-card.png"
            alt=""
            className="h-full w-full object-contain object-bottom"
            draggable={false}
          />
        </div>
        <Link
          to="/cars/$carId"
          params={{ carId: car.id }}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-content transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Info
            className="size-3.5"
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          {LL.externalPanel.auditLogs.details()}
        </Link>
      </div>
    </article>
  );
}
