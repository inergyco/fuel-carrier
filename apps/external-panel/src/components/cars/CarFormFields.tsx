import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { FormInput, FormSelect, FormTextarea } from '@fuel-carrier/web-ui/ui'

interface CarFormFieldsProps {
  drivers: Driver[]
  serverError: string | null
}

export function CarFormFields({ drivers, serverError }: CarFormFieldsProps) {
  const { LL } = useI18nContext()

  return (
    <>
      <FormInput
        name="licensePlate"
        label={LL.externalPanel.cars.licensePlate()}
        type="text"
      />

      <FormInput
        name="name"
        label={LL.externalPanel.cars.name()}
        type="text"
      />

      <FormSelect name="driverId" label={LL.externalPanel.cars.driver()}>
        <option value="">{LL.externalPanel.cars.noDriver()}</option>
        {drivers.map(function renderDriverOption(driver) {
          return (
            <option key={driver.id} value={driver.id}>
              {driver.firstName} {driver.lastName}
            </option>
          )
        })}
      </FormSelect>

      <FormTextarea
        name="note"
        label={LL.externalPanel.cars.note()}
        rows={3}
      />

      {serverError && (
        <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
          {serverError}
        </div>
      )}
    </>
  )
}
