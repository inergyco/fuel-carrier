import { useI18nContext } from '@fuel-carrier/i18n/react'
import { CompanyUserLevels } from '@fuel-carrier/shared-types'
import { COMPANY_USER_NATIONAL_ID_MAX_LENGTH } from '@fuel-carrier/shared-validation/company-user/create'
import { PASSWORD_MIN_LENGTH } from '@fuel-carrier/shared-validation/password'
import { FormInput, FormSelect, ProfileImageUploader } from '@fuel-carrier/web-ui/ui'
import type { CompanyUserFormModalMode } from './company-user-form.schema'

interface CompanyUserFormFieldsProps {
  mode: CompanyUserFormModalMode
  serverError: string | null
  imageUrl: string | null
  imageError?: string
  disabled?: boolean
  onUploadImage: (file: File) => Promise<void>
  onRemoveImage: () => Promise<void>
}

export function CompanyUserFormFields({
  mode,
  serverError,
  imageUrl,
  imageError,
  disabled = false,
  onUploadImage,
  onRemoveImage,
}: CompanyUserFormFieldsProps) {
  const { LL } = useI18nContext()

  return (
    <>
      <ProfileImageUploader
        imageUrl={imageUrl}
        error={imageError}
        disabled={disabled}
        onUploadFile={onUploadImage}
        onRemove={onRemoveImage}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="firstName"
          label={LL.externalPanel.users.firstName()}
          type="text"
          noDigits
          autoComplete="given-name"
        />
        <FormInput
          name="lastName"
          label={LL.externalPanel.users.lastName()}
          type="text"
          noDigits
          autoComplete="family-name"
        />
      </div>

      <FormInput
        name="username"
        label={LL.externalPanel.users.username()}
        type="text"
        autoComplete="username"
      />

      <FormInput
        name="nationalId"
        label={LL.externalPanel.users.nationalId()}
        type="text"
        digitsOnly
        maxLength={COMPANY_USER_NATIONAL_ID_MAX_LENGTH}
        autoComplete="off"
      />

      <FormInput
        name="email"
        label={LL.externalPanel.users.email()}
        type="email"
        autoComplete="email"
      />

      <FormSelect name="level" label={LL.common.companyUserLevel.label()}>
        <option value={CompanyUserLevels.ADMIN}>
          {LL.common.companyUserLevel.admin()}
        </option>
        <option value={CompanyUserLevels.VIEWER}>
          {LL.common.companyUserLevel.viewer()}
        </option>
      </FormSelect>

      <FormInput
        name="password"
        label={
          mode === 'edit'
            ? LL.externalPanel.users.passwordOptional()
            : LL.externalPanel.users.password()
        }
        type="password"
        autoComplete="new-password"
        placeholder={
          mode === 'edit'
            ? LL.validation.passwordMinLength({ min: PASSWORD_MIN_LENGTH })
            : undefined
        }
      />

      {serverError && (
        <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
          {serverError}
        </div>
      )}
    </>
  )
}
