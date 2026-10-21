import type { Driver } from "@fuel-carrier/shared-types";
import type { TranslationFunctions } from "@fuel-carrier/i18n";
import { Avatar, LicensePlate } from "@fuel-carrier/web-ui/ui";
import type { ResourceColumn } from "../users/ResourceSection";

interface DriverColumnOptions {
  LL: TranslationFunctions;
  emptyCell?: string;
}

export function getDriverColumns({
  LL,
  emptyCell,
}: DriverColumnOptions): ResourceColumn<Driver>[] {
  return [
    {
      key: "name",
      header: LL.externalPanel.drivers.name(),
      cell: function renderName(driver) {
        return (
          <span className="inline-flex items-center gap-2.5">
            <Avatar
              src={driver.imageUrl}
              fallback={driver.firstName.charAt(0)}
            />
            <span>
              {driver.firstName} {driver.lastName}
            </span>
          </span>
        );
      },
    },
    {
      key: "nationalId",
      header: LL.externalPanel.drivers.nationalId(),
      cell: function renderNationalId(driver) {
        return driver.nationalId ?? emptyCell;
      },
      className: "font-mono text-sm",
    },
    {
      key: "mobileNumber",
      header: LL.externalPanel.drivers.mobileNumber(),
      cell: function renderMobileNumber(driver) {
        return driver.mobileNumber ?? emptyCell;
      },
      className: "font-mono text-sm",
    },
    {
      key: "car",
      header: LL.externalPanel.drivers.car(),
      cell: function renderCar(driver) {
        if (!driver.car) {
          return emptyCell ?? LL.externalPanel.drivers.noCar();
        }
        return <LicensePlate value={driver.car.licensePlate} size="sm" />;
      },
    },
  ];
}
