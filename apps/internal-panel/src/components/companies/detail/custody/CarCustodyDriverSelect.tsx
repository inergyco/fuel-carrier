import type { Car, Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Select } from '@fuel-carrier/web-ui/ui'
import type { CompanyCarCustodyApi } from './useCompanyCarCustody'

type CarCustodyDriverSelectProps = {
  car: Car
  custody: CompanyCarCustodyApi
  selectedDriverId: string
  onChange: (driverId: string) => void
}

function isSelectableDriver(driver: Driver, car: Car): boolean {
  if (!driver.car) {
    return true
  }

  return driver.car.id === car.id
}

export function CarCustodyDriverSelect({
  car,
  custody,
  selectedDriverId,
  onChange,
}: CarCustodyDriverSelectProps) {
  const { LL } = useI18nContext()
  const detail = LL.internalPanel.companies.detail
  const selectableDrivers = custody.drivers.filter(function filterSelectable(
    driver: Driver,
  ) {
    return isSelectableDriver(driver, car)
  })

  return (
    <Select
      label={detail.driver()}
      value={selectedDriverId}
      disabled={custody.driversLoading || custody.mutation.isPending}
      className="h-11 border-base-content/12 bg-base-100/60"
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">
        {custody.driversLoading
          ? LL.internalPanel.companies.loading()
          : detail.selectDriver()}
      </option>
      {selectableDrivers.map(function renderDriverOption(driver: Driver) {
        return (
          <option key={driver.id} value={driver.id}>
            {custody.driverLabel(driver)}
          </option>
        )
      })}
    </Select>
  )
}
