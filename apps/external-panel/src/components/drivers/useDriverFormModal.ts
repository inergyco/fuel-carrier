import { useState } from 'react'
import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import {
  zodResolver,
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from '@fuel-carrier/web-ui/form'
import { useMutation } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import {
  createDriver,
  driverToFormValues,
  updateDriver,
} from '../../lib/api/drivers'
import {
  driverFormSchema,
  type DriverFormInput,
  type DriverFormModalMode,
  type DriverFormOutput,
} from './driver-form.schema'

interface UseDriverFormModalOptions {
  mode: DriverFormModalMode
  driver?: Driver
  onClose: () => void
  onSuccess: () => void
}

interface UseDriverFormModalResult {
  form: UseFormReturn<DriverFormInput, unknown, DriverFormOutput>
  serverError: string | null
  isSaving: boolean
  title: string
  confirmLabel: string
  onSubmit: SubmitHandler<DriverFormOutput>
  handleClose: () => void
}

export function useDriverFormModal({
  mode,
  driver,
  onClose,
  onSuccess,
}: UseDriverFormModalOptions): UseDriverFormModalResult {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<DriverFormInput, unknown, DriverFormOutput>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: driverToFormValues(driver),
  })

  const {
    setError,
    formState: { isSubmitting },
  } = form

  const saveMutation = useMutation({
    mutationFn: async function saveDriver(data: DriverFormOutput) {
      if (mode === 'edit' && driver) {
        return updateDriver(driver.id, data)
      }

      return createDriver(data)
    },
    onSuccess: function handleSaveSuccess() {
      toast.success(
        mode === 'edit'
          ? LL.externalPanel.toast.driverUpdated()
          : LL.externalPanel.toast.driverCreated(),
      )
      onSuccess()
      onClose()
    },
  })

  const onSubmit: SubmitHandler<DriverFormOutput> = async function onSubmit(
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
    if (isApiClientError(error)) {
      if (error.apiError.fields?.length) {
        for (const fieldError of error.apiError.fields) {
          if (
            fieldError.field === 'firstName' ||
            fieldError.field === 'lastName' ||
            fieldError.field === 'nationalId'
          ) {
            setError(fieldError.field, { message: fieldError.message })
          }
        }
      }

      if (error.apiError.fields?.some((field) => field.field === 'nationalId')) {
        setServerError(LL.externalPanel.drivers.duplicateNationalId())
        return
      }

      setServerError(error.apiError.message)
      return
    }

    setServerError(LL.externalPanel.drivers.createFailed())
  }

  function handleClose() {
    if (!isSubmitting && !saveMutation.isPending) {
      onClose()
    }
  }

  const isSaving = isSubmitting || saveMutation.isPending
  const title =
    mode === 'edit'
      ? LL.externalPanel.drivers.editTitle()
      : LL.externalPanel.drivers.createTitle()

  const confirmLabel =
    mode === 'edit'
      ? LL.externalPanel.drivers.update()
      : LL.externalPanel.drivers.addDriver()

  return {
    form,
    serverError,
    isSaving,
    title,
    confirmLabel,
    onSubmit,
    handleClose,
  }
}
