import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  CarTankFields,
  FormCheckbox,
  FormLicensePlatePicker,
  FormSelect,
  FormTextarea,
} from '@fuel-carrier/web-ui/ui'
import type { CarFormModalMode } from './car-form.schema'

interface CarFormFieldsProps {
  mode: CarFormModalMode
  drivers: Driver[]
  serverError: string | null
}

export function CarFormFields({
  mode,
  drivers,
  serverError,
}: CarFormFieldsProps) {
  const { LL } = useI18nContext()
  const detail = LL.internalPanel.companies.detail
  const freeDrivers = drivers.filter((driver) => !driver.car)

  return (
    <>
      <FormLicensePlatePicker
        name="licensePlate"
        label={detail.licensePlate()}
      />

      {mode === 'create' ? (
        <FormSelect name="driverId" label={detail.driver()}>
          <option value="">{detail.selectDriver()}</option>
          {freeDrivers.map(function renderDriverOption(driver) {
            return (
              <option key={driver.id} value={driver.id}>
                {driver.firstName} {driver.lastName}
              </option>
            )
          })}
        </FormSelect>
      ) : null}

      <FormCheckbox name="hasHighGrade" label={detail.hasHighGrade()} />

      <CarTankFields
        tankCountLabel={detail.tankCount()}
        tankCapacityLabel={detail.tankCapacityLiters()}
        tankCapacityHint={detail.tankCapacityHint()}
      />

      <FormTextarea
        name="note"
        label={LL.internalPanel.companies.note()}
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
