import { Form } from '@fuel-carrier/web-ui/form'
import { CompanyFormFields } from './CompanyFormFields'
import type { CompanyFormProps } from './companyFormValidation'
import { useCompanyForm } from './useCompanyForm'

export function CompanyForm({
  mode,
  company,
  onCancel,
  onSaved,
}: CompanyFormProps) {
  const {
    form,
    onSubmit,
    logoUrl,
    logoError,
    isSaving,
    serverError,
    handleUploadLogo,
    handleRemoveLogo,
    handleCancel,
  } = useCompanyForm({ mode, company, onCancel, onSaved })

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm sm:p-6">
        <Form
          form={form}
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          <CompanyFormFields
            mode={mode}
            logoUrl={logoUrl}
            logoError={logoError}
            isSaving={isSaving}
            serverError={serverError}
            onUploadLogo={handleUploadLogo}
            onRemoveLogo={handleRemoveLogo}
            onCancel={handleCancel}
          />
        </Form>
      </section>
    </div>
  )
}
