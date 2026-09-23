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

export function CarCustodyDriverSelect({
  car,
  custody,
  selectedDriverId,
  onChange,
}: CarCustodyDriverSelectProps) {
  const { LL } = useI18nContext()
  const detail = LL.internalPanel.companies.detail

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
          : detail.noDriver()}
      </option>
      {custody.drivers.map(function renderDriverOption(driver: Driver) {
        const onOther =
          driver.car && driver.car.id !== car.id
            ? detail.driverOnOtherVehicle({
                licensePlate: driver.car.licensePlate,
              })
            : null

        return (
          <option key={driver.id} value={driver.id}>
            {custody.driverLabel(driver)}
            {onOther ? ` — ${onOther}` : ''}
          </option>
        )
      })}
    </Select>
  )
}
