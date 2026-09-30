import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { FormInput, FormSelect, FormTextarea } from '@fuel-carrier/web-ui/ui'

interface CarFormFieldsProps {
  mode: 'create' | 'edit'
  drivers: Driver[]
  serverError: string | null
}

export function CarFormFields({
  mode,
  drivers,
  serverError,
}: CarFormFieldsProps) {
  const { LL } = useI18nContext()
  const freeDrivers = drivers.filter((driver) => !driver.car)

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

      {mode === 'create' ? (
        <FormSelect name="driverId" label={LL.externalPanel.cars.driver()}>
          <option value="">{LL.externalPanel.cars.selectDriver()}</option>
          {freeDrivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.firstName} {driver.lastName}
            </option>
          ))}
        </FormSelect>
      ) : null}

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
