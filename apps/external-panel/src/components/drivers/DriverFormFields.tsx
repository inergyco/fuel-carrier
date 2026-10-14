import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  DRIVER_MOBILE_NUMBER_MAX_LENGTH,
  DRIVER_NATIONAL_ID_MAX_LENGTH,
} from '@fuel-carrier/shared-validation/driver/create'
import { DriverImageUploader, FormInput } from '@fuel-carrier/web-ui/ui'

interface DriverFormFieldsProps {
  serverError: string | null
  imageUrl: string | null
  imageError?: string
  disabled?: boolean
  onUploadImage: (file: File) => Promise<void>
  onRemoveImage: () => Promise<void>
}

export function DriverFormFields({
  serverError,
  imageUrl,
  imageError,
  disabled = false,
  onUploadImage,
  onRemoveImage,
}: DriverFormFieldsProps) {
  const { LL } = useI18nContext()

  return (
    <>
      <DriverImageUploader
        imageUrl={imageUrl}
        error={imageError}
        disabled={disabled}
        onUploadFile={onUploadImage}
        onRemove={onRemoveImage}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="firstName"
          label={LL.externalPanel.drivers.firstName()}
          type="text"
          noDigits
          autoComplete="given-name"
        />
        <FormInput
          name="lastName"
          label={LL.externalPanel.drivers.lastName()}
          type="text"
          noDigits
          autoComplete="family-name"
        />
      </div>

      <FormInput
        name="nationalId"
        label={LL.externalPanel.drivers.nationalId()}
        type="text"
        digitsOnly
        maxLength={DRIVER_NATIONAL_ID_MAX_LENGTH}
        autoComplete="off"
      />

      <FormInput
        name="mobileNumber"
        label={LL.externalPanel.drivers.mobileNumber()}
        type="tel"
        digitsOnly
        maxLength={DRIVER_MOBILE_NUMBER_MAX_LENGTH}
        autoComplete="tel"
        placeholder={LL.externalPanel.drivers.mobileNumberPlaceholder()}
      />

      {serverError && (
        <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
          {serverError}
        </div>
      )}
    </>
  )
}
