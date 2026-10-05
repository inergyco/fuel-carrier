import { useState } from 'react'
import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { applyApiFieldErrors } from '@fuel-carrier/web-ui/api'
import {
  zodResolver,
  useForm,
  useWatch,
  type SubmitHandler,
  type UseFormReturn,
} from '@fuel-carrier/web-ui/form'
import { useMutation } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import {
  createDriver,
  driverToFormValues,
  removeDriverImage,
  replaceDriverImage,
  updateDriver,
  uploadDriverImage,
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
  imageUrl: string | null
  imageError?: string
  onUploadImage: (file: File) => Promise<void>
  onRemoveImage: () => Promise<void>
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
    control,
    setValue,
    formState: { isSubmitting, errors },
  } = form
  const imageUrlValue = useWatch({ control, name: 'imageUrl' })
  const imageUrl =
    typeof imageUrlValue === 'string' && imageUrlValue.length > 0
      ? imageUrlValue
      : null

  const saveMutation = useMutation({
    mutationFn: async function saveDriver(data: DriverFormOutput) {
      if (mode === 'edit' && driver) {
        const nextImageUrl = data.imageUrl ?? null
        const previousImageUrl = driver.imageUrl ?? null

        if (nextImageUrl !== previousImageUrl) {
          if (nextImageUrl === null) {
            await removeDriverImage(driver.id)
          } else {
            await replaceDriverImage(driver.id, nextImageUrl)
          }
        }

        return updateDriver(driver.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          nationalId: data.nationalId,
          mobileNumber: data.mobileNumber,
        })
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

  async function onUploadImage(file: File) {
    const uploaded = await uploadDriverImage(file)
    setValue('imageUrl', uploaded.imageUrl, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  async function onRemoveImage() {
    setValue('imageUrl', '', { shouldDirty: true, shouldValidate: true })
  }

  function handleFormError(error: unknown) {
    setServerError(
      applyApiFieldErrors({
        error,
        setError,
        fields: [
          'firstName',
          'lastName',
          'nationalId',
          'mobileNumber',
          'imageUrl',
        ],
        messages: {
          nationalId: () => LL.externalPanel.drivers.duplicateNationalId(),
          mobileNumber: () => LL.externalPanel.drivers.duplicateMobileNumber(),
        },
        fallbackMessage: LL.externalPanel.drivers.createFailed(),
      }),
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
    imageUrl,
    imageError: errors.imageUrl?.message?.toString(),
    onUploadImage,
    onRemoveImage,
    onSubmit,
    handleClose,
  }
}
