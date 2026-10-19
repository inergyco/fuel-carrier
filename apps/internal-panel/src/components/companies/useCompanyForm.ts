import { useMemo, useState } from 'react'
import type { Company } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  createCreateCompanyDtoSchema,
  type CreateCompanyDto,
} from '@fuel-carrier/shared-validation/company/create'
import { applyApiFieldErrors } from '@fuel-carrier/web-ui/api'
import {
  zodResolver,
  useForm,
  useWatch,
  type SubmitHandler,
} from '@fuel-carrier/web-ui/form'
import { useMutation } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import { companyToFormValues, uploadCompanyLogo } from '../../lib/api/companies'
import {
  COMPANY_FORM_FIELDS,
  toCompanyFormValidationMessages,
  type CompanyFormInput,
  type CompanyFormProps,
} from './companyFormValidation'
import { saveCompanyRecord } from './save-company-form'

export function useCompanyForm({
  mode,
  company,
  onCancel,
  onSaved,
}: CompanyFormProps) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const companySchema = useMemo(
    function createSchema() {
      return createCreateCompanyDtoSchema(toCompanyFormValidationMessages(LL))
    },
    [LL],
  )

  const form = useForm<CompanyFormInput, unknown, CreateCompanyDto>({
    resolver: zodResolver(companySchema),
    defaultValues: companyToFormValues(company),
  })

  const {
    setError,
    control,
    setValue,
    formState: { isSubmitting, errors },
  } = form
  const logoUrl = useWatch({ control, name: 'logoUrl' })

  const saveMutation = useMutation<Company, Error, CreateCompanyDto>({
    mutationFn: (data) => saveCompanyRecord({ mode, company, data }),
    onSuccess: function handleSaveSuccess(saved) {
      toast.success(
        mode === 'edit'
          ? LL.internalPanel.toast.companyUpdated()
          : LL.internalPanel.toast.companyCreated(),
      )
      onSaved(saved)
    },
  })

  const onSubmit: SubmitHandler<CreateCompanyDto> = async function onSubmit(
    data,
  ) {
    setServerError(null)

    try {
      await saveMutation.mutateAsync(data)
    } catch (error) {
      handleFormError(error)
    }
  }

  function handleFormError(error: unknown) {
    setServerError(
      applyApiFieldErrors({
        error,
        setError,
        fields: COMPANY_FORM_FIELDS,
        messages: {
          nationalId: () => LL.internalPanel.companies.duplicateNationalId(),
        },
        fallbackMessage:
          mode === 'edit'
            ? LL.internalPanel.companies.updateFailed()
            : LL.internalPanel.companies.createFailed(),
      }),
    )
  }

  async function handleUploadLogo(file: File) {
    const uploaded = await uploadCompanyLogo(file)
    setValue('logoUrl', uploaded.logoUrl, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  async function handleRemoveLogo() {
    setValue('logoUrl', '', { shouldDirty: true, shouldValidate: true })
  }

  function handleCancel() {
    if (!isSubmitting && !saveMutation.isPending) {
      onCancel()
    }
  }

  return {
    form,
    onSubmit,
    logoUrl: typeof logoUrl === 'string' ? logoUrl : null,
    logoError: errors.logoUrl?.message?.toString(),
    isSaving: isSubmitting || saveMutation.isPending,
    serverError,
    handleUploadLogo,
    handleRemoveLogo,
    handleCancel,
  }
}
