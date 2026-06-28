import { useMemo, useState } from 'react'
import type { Company } from '@fuel-carrier/shared-types'
import { ApiErrorCode } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  COMPANY_ADDRESS_MAX_LENGTH,
  COMPANY_LOGO_URL_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_NATIONAL_ID_MAX_LENGTH,
  COMPANY_NOTE_MAX_LENGTH,
  COMPANY_PHONE_MAX_LENGTH,
} from '@fuel-carrier/shared-validation/company/constants'
import {
  createCreateCompanyDtoSchema,
  type CreateCompanyDto,
} from '@fuel-carrier/shared-validation/company/create'
import type { z } from 'zod'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import { zodResolver, Form, useForm, type SubmitHandler } from '@fuel-carrier/web-ui/form'
import { useMutation } from '@fuel-carrier/web-ui/query'
import { FormInput, FormTextarea, Modal, ModalActions, useToast } from '@fuel-carrier/web-ui/ui'
import {
  companyToFormValues,
  createCompany,
  updateCompany,
} from '../../lib/api/companies'

type CompanyFormModalMode = 'create' | 'edit'

type CompanyFormInput = z.input<ReturnType<typeof createCreateCompanyDtoSchema>>

interface CompanyFormModalProps {
  mode: CompanyFormModalMode
  company?: Company
  onClose: () => void
  onSuccess: () => void
}

export function CompanyFormModal({
  mode,
  company,
  onClose,
  onSuccess,
}: CompanyFormModalProps) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const companySchema = useMemo(
    function createSchema() {
      return createCreateCompanyDtoSchema({
        nameRequired: LL.validation.companyNameRequired(),
        nameTooLong: LL.validation.companyNameTooLong({
          max: COMPANY_NAME_MAX_LENGTH,
        }),
        nationalIdRequired: LL.validation.companyNationalIdRequired(),
        nationalIdTooLong: LL.validation.companyNationalIdTooLong({
          max: COMPANY_NATIONAL_ID_MAX_LENGTH,
        }),
        phoneNumberRequired: LL.validation.companyPhoneNumberRequired(),
        phoneNumberTooLong: LL.validation.companyPhoneNumberTooLong({
          max: COMPANY_PHONE_MAX_LENGTH,
        }),
        addressTooLong: LL.validation.companyAddressTooLong({
          max: COMPANY_ADDRESS_MAX_LENGTH,
        }),
        noteTooLong: LL.validation.companyNoteTooLong({
          max: COMPANY_NOTE_MAX_LENGTH,
        }),
        logoUrlTooLong: LL.validation.companyLogoUrlTooLong({
          max: COMPANY_LOGO_URL_MAX_LENGTH,
        }),
        logoUrlInvalid: LL.validation.companyLogoUrlInvalid(),
      })
    },
    [LL],
  )

  const form = useForm<CompanyFormInput, unknown, CreateCompanyDto>({
    resolver: zodResolver(companySchema),
    defaultValues: companyToFormValues(company),
  })

  const {
    setError,
    formState: { isSubmitting },
  } = form

  const saveMutation = useMutation<Company, Error, CreateCompanyDto>({
    mutationFn: function saveCompany(data) {
      if (mode === 'edit' && company) {
        return updateCompany(company.id, data)
      }

      return createCompany(data)
    },
    onSuccess: function handleSaveSuccess() {
      toast.success(
        mode === 'edit'
          ? LL.internalPanel.toast.companyUpdated()
          : LL.internalPanel.toast.companyCreated(),
      )
      onSuccess()
      onClose()
    },
  })

  const onSubmit: SubmitHandler<CreateCompanyDto> = async function onSubmit(data) {
    setServerError(null)

    try {
      await saveMutation.mutateAsync(data)
    } catch (error) {
      handleFormError(error)
    }
  }

  function handleFormError(error: unknown) {
    if (isApiClientError(error)) {
      if (error.apiError.fields?.length) {
        for (const fieldError of error.apiError.fields) {
          if (
            fieldError.field === 'name' ||
            fieldError.field === 'nationalId' ||
            fieldError.field === 'phoneNumber' ||
            fieldError.field === 'address' ||
            fieldError.field === 'note' ||
            fieldError.field === 'logoUrl'
          ) {
            setError(fieldError.field, { message: fieldError.message })
          }
        }
      }

      if (
        error.apiError.code === ApiErrorCode.VALIDATION_ERROR &&
        error.apiError.fields?.some((field) => field.field === 'nationalId')
      ) {
        setServerError(LL.internalPanel.companies.duplicateNationalId())
        return
      }

      setServerError(error.apiError.message)
      return
    }

    setServerError(
      mode === 'edit'
        ? LL.internalPanel.companies.updateFailed()
        : LL.internalPanel.companies.createFailed(),
    )
  }

  function handleClose() {
    if (!isSubmitting && !saveMutation.isPending) {
      onClose()
    }
  }

  const isSaving = isSubmitting || saveMutation.isPending
  const title =
    mode === 'edit'
      ? LL.internalPanel.companies.editTitle()
      : LL.internalPanel.companies.createTitle()

  return (
    <Modal
      open
      title={title}
      onClose={handleClose}
      closeDisabled={isSaving}
      footer={
        <ModalActions
          cancelLabel={LL.internalPanel.nav.cancel()}
          confirmLabel={
            mode === 'edit'
              ? LL.internalPanel.companies.update()
              : LL.internalPanel.companies.create()
          }
          confirmType="submit"
          confirmForm="company-form"
          loading={isSaving}
          loadingLabel={
            mode === 'edit'
              ? LL.internalPanel.companies.updating()
              : LL.internalPanel.companies.creating()
          }
          onCancel={handleClose}
          cancelDisabled={isSaving}
        />
      }
    >
      <Form
        form={form}
        id="company-form"
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
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
          inputMode="numeric"
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

        <FormInput
          name="logoUrl"
          label={LL.internalPanel.companies.logoUrl()}
          type="url"
          placeholder={LL.internalPanel.companies.logoUrlPlaceholder()}
        />

        <FormTextarea
          name="note"
          label={LL.internalPanel.companies.note()}
          rows={4}
          placeholder={LL.internalPanel.companies.notePlaceholder()}
        />

        {serverError && (
          <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
            {serverError}
          </div>
        )}
      </Form>
    </Modal>
  )
}
