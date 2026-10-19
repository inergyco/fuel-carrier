import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  Button,
  CompanyLogoUploader,
  CompanyPricingFields,
  FormInput,
  FormTextarea,
} from '@fuel-carrier/web-ui/ui'
import type { CompanyFormMode } from './companyFormValidation'

interface CompanyFormFieldsProps {
  mode: CompanyFormMode
  logoUrl: string | null
  logoError?: string
  isSaving: boolean
  serverError: string | null
  onUploadLogo: (file: File) => Promise<void>
  onRemoveLogo: () => Promise<void>
  onCancel: () => void
}

export function CompanyFormFields({
  mode,
  logoUrl,
  logoError,
  isSaving,
  serverError,
  onUploadLogo,
  onRemoveLogo,
  onCancel,
}: CompanyFormFieldsProps) {
  const { LL } = useI18nContext()

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          name="name"
          label={LL.internalPanel.companies.name()}
          type="text"
          autoComplete="organization"
          placeholder={LL.internalPanel.companies.namePlaceholder()}
        />

        <FormInput
          name="nationalId"
          label={LL.internalPanel.companies.nationalId()}
          type="text"
          digitsOnly
          placeholder={LL.internalPanel.companies.nationalIdPlaceholder()}
        />

        <FormInput
          name="phoneNumber"
          label={LL.internalPanel.companies.phoneNumber()}
          type="tel"
          autoComplete="tel"
          placeholder={LL.internalPanel.companies.phoneNumberPlaceholder()}
        />

        <FormInput
          name="address"
          label={LL.internalPanel.companies.address()}
          type="text"
          autoComplete="street-address"
          placeholder={LL.internalPanel.companies.addressPlaceholder()}
        />
      </div>

      <CompanyLogoUploader
        logoUrl={logoUrl}
        error={logoError}
        disabled={isSaving}
        onUploadFile={onUploadLogo}
        onRemove={onRemoveLogo}
      />

      <FormTextarea
        name="note"
        label={LL.internalPanel.companies.note()}
        rows={4}
        placeholder={LL.internalPanel.companies.notePlaceholder()}
      />

      <CompanyPricingFields />

      {serverError ? (
        <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
          {serverError}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-base-content/8 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="sm:w-auto sm:px-5"
          onClick={onCancel}
          disabled={isSaving}
        >
          {LL.internalPanel.nav.cancel()}
        </Button>
        <Button
          type="submit"
          className="sm:w-auto sm:px-5"
          loading={isSaving}
          loadingText={
            mode === 'edit'
              ? LL.internalPanel.companies.updating()
              : LL.internalPanel.companies.creating()
          }
        >
          {mode === 'edit'
            ? LL.internalPanel.companies.update()
            : LL.internalPanel.companies.create()}
        </Button>
      </div>
    </>
  )
}
