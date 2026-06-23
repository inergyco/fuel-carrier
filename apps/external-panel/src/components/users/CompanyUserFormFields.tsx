import { useI18nContext } from '@fuel-carrier/i18n/react'
import { PASSWORD_MIN_LENGTH } from '@fuel-carrier/shared-validation/password'
import { FormInput } from '@fuel-carrier/web-ui/ui'
import type { CompanyUserFormModalMode } from './company-user-form.schema'

interface CompanyUserFormFieldsProps {
  mode: CompanyUserFormModalMode
  serverError: string | null
}

export function CompanyUserFormFields({ mode, serverError }: CompanyUserFormFieldsProps) {
  const { LL } = useI18nContext()

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="firstName"
          label={LL.externalPanel.users.firstName()}
          type="text"
          autoComplete="given-name"
        />
        <FormInput
          name="lastName"
          label={LL.externalPanel.users.lastName()}
          type="text"
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
        inputMode="numeric"
      />

      <FormInput
        name="email"
        label={LL.externalPanel.users.email()}
        type="email"
        autoComplete="email"
      />

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
