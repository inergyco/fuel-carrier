import { useState } from 'react'
import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  createInternalDriverDtoSchema,
  type CreateExternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create'
import { applyApiFieldErrors } from '@fuel-carrier/web-ui/api'
import {
  zodResolver,
  Form,
  useForm,
  useWatch,
  type SubmitHandler,
} from '@fuel-carrier/web-ui/form'
import { useMutation } from '@fuel-carrier/web-ui/query'
import {
  DriverImageUploader,
  FormInput,
  Modal,
  ModalActions,
  useToast,
} from '@fuel-carrier/web-ui/ui'
import { z } from 'zod'
import {
  createDriver,
  driverToFormValues,
  removeDriverImage,
  replaceDriverImage,
  updateDriver,
  uploadDriverImage,
} from '../../../lib/api/drivers'

const driverFormSchema = createInternalDriverDtoSchema.omit({ companyId: true })
type DriverFormInput = z.input<typeof driverFormSchema>

type DriverFormModalMode = 'create' | 'edit'

interface DriverFormModalProps {
  mode: DriverFormModalMode
  companyId: string
  driver?: Driver
  onClose: () => void
  onSuccess: () => void
}

export function DriverFormModal({
  mode,
  companyId,
  driver,
  onClose,
  onSuccess,
}: DriverFormModalProps) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<DriverFormInput, unknown, CreateExternalDriverDto>({
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
    mutationFn: async function saveDriver(data: CreateExternalDriverDto) {
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

      return createDriver({ ...data, companyId })
    },
    onSuccess: function handleSaveSuccess() {
      toast.success(
        mode === 'edit'
          ? LL.internalPanel.toast.driverUpdated()
          : LL.internalPanel.toast.driverCreated(),
      )
      onSuccess()
      onClose()
    },
  })

  const onSubmit: SubmitHandler<CreateExternalDriverDto> = async function onSubmit(
    data,
  ) {
    setServerError(null)

    try {
      await saveMutation.mutateAsync(data)
    } catch (error) {
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
            nationalId: () =>
              LL.internalPanel.companies.detail.duplicateDriverNationalId(),
            mobileNumber: () =>
              LL.internalPanel.companies.detail.duplicateDriverMobileNumber(),
          },
          fallbackMessage: LL.internalPanel.companies.detail.createFailed(),
        }),
      )
    }
  }

  async function handleUploadImage(file: File) {
    const uploaded = await uploadDriverImage(file)
    setValue('imageUrl', uploaded.imageUrl, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  async function handleRemoveImage() {
    setValue('imageUrl', '', { shouldDirty: true, shouldValidate: true })
  }

  function handleClose() {
    if (!isSubmitting && !saveMutation.isPending) {
      onClose()
    }
  }

  const isSaving = isSubmitting || saveMutation.isPending
  const title =
    mode === 'edit'
      ? LL.internalPanel.companies.detail.driverEditTitle()
      : LL.internalPanel.companies.detail.driverCreateTitle()

  const confirmLabel =
    mode === 'edit'
      ? LL.internalPanel.companies.update()
      : LL.internalPanel.companies.detail.addDriver()

  return (
    <Modal
      open
      title={title}
      onClose={handleClose}
      closeDisabled={isSaving}
      footer={
        <ModalActions
          cancelLabel={LL.internalPanel.nav.cancel()}
          confirmLabel={confirmLabel}
          confirmType="submit"
          confirmForm="driver-form"
          loading={isSaving}
          loadingLabel={LL.internalPanel.companies.updating()}
          onCancel={handleClose}
          cancelDisabled={isSaving}
        />
      }
    >
      <Form
        form={form}
        id="driver-form"
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <DriverImageUploader
          imageUrl={imageUrl}
          error={errors.imageUrl?.message?.toString()}
          disabled={isSaving}
          onUploadFile={handleUploadImage}
          onRemove={handleRemoveImage}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            name="firstName"
            label={LL.internalPanel.companies.detail.firstName()}
            type="text"
            autoComplete="given-name"
          />
          <FormInput
            name="lastName"
            label={LL.internalPanel.companies.detail.lastName()}
            type="text"
            autoComplete="family-name"
          />
        </div>

        <FormInput
          name="nationalId"
          label={LL.internalPanel.companies.nationalId()}
          type="text"
          inputMode="numeric"
        />

        <FormInput
          name="mobileNumber"
          label={LL.internalPanel.companies.detail.mobileNumber()}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={LL.internalPanel.companies.detail.mobileNumberPlaceholder()}
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
