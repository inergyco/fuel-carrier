import { useI18nContext } from '@fuel-carrier/i18n/react'
import { FormInput } from '@fuel-carrier/web-ui/ui'

interface DriverFormFieldsProps {
  serverError: string | null
}

export function DriverFormFields({ serverError }: DriverFormFieldsProps) {
  const { LL } = useI18nContext()

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="firstName"
          label={LL.externalPanel.drivers.firstName()}
          type="text"
          autoComplete="given-name"
        />
        <FormInput
          name="lastName"
          label={LL.externalPanel.drivers.lastName()}
          type="text"
          autoComplete="family-name"
        />
      </div>

      <FormInput
        name="nationalId"
        label={LL.externalPanel.drivers.nationalId()}
        type="text"
        inputMode="numeric"
      />

      {serverError && (
        <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
          {serverError}
        </div>
      )}
    </>
  )
}
