import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Select } from '@fuel-carrier/web-ui/ui'
import type { CarCustodyApi } from './useCarCustody'

interface CarCustodyDriverSelectProps {
  car: Car
  custody: CarCustodyApi
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
  const selectableDrivers = custody.drivers.filter(
    (driver) => !driver.car || driver.car.id === car.id,
  )

  return (
    <Select
      label={LL.externalPanel.cars.driver()}
      value={selectedDriverId}
      disabled={custody.driversLoading || custody.mutation.isPending}
      className="h-11 border-base-content/12 bg-base-100"
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">
        {custody.driversLoading
          ? LL.externalPanel.cars.loading()
          : LL.externalPanel.cars.selectDriver()}
      </option>
      {selectableDrivers.map((driver) => (
        <option key={driver.id} value={driver.id}>
          {custody.driverLabel(driver)}
        </option>
      ))}
    </Select>
  )
}
