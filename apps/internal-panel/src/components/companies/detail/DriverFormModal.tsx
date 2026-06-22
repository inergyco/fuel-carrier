import { useState } from 'react'
import type { Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  createInternalDriverDtoSchema,
  type CreateExternalDriverDto,
} from '@fuel-carrier/shared-validation/driver/create'
import { isApiClientError } from '@fuel-carrier/web-ui/api'
import { zodResolver, Form, useForm, type SubmitHandler } from '@fuel-carrier/web-ui/form'
import { useMutation } from '@fuel-carrier/web-ui/query'
import { FormInput, Modal, ModalActions } from '@fuel-carrier/web-ui/ui'
import { z } from 'zod'
import {
  createDriver,
  driverToFormValues,
  updateDriver,
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
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<DriverFormInput, unknown, CreateExternalDriverDto>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: driverToFormValues(driver),
  })

  const {
    setError,
    formState: { isSubmitting },
  } = form

  const saveMutation = useMutation({
    mutationFn: function saveDriver(data: CreateExternalDriverDto) {
      if (mode === 'edit' && driver) {
        return updateDriver(driver.id, data)
      }

      return createDriver({ ...data, companyId })
    },
    onSuccess: function handleSaveSuccess() {
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

          if (error.apiError.fields.some((field) => field.field === 'nationalId')) {
            setServerError(LL.internalPanel.companies.detail.duplicateDriverNationalId())
            return
          }
        }

        setServerError(error.apiError.message)
        return
      }

      setServerError(LL.internalPanel.companies.detail.createFailed())
    }
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

        {serverError && (
          <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
            {serverError}
          </div>
        )}
      </Form>
    </Modal>
  )
}
