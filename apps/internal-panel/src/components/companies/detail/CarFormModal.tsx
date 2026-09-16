import { useState } from 'react'
import type { Car, Driver } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  createInternalCarDtoSchema,
  type CreateInternalCarDto,
} from '@fuel-carrier/shared-validation/car/create'
import { applyApiFieldErrors } from '@fuel-carrier/web-ui/api'
import {
  zodResolver,
  Form,
  useForm,
  type SubmitHandler,
} from '@fuel-carrier/web-ui/form'
import { useMutation } from '@fuel-carrier/web-ui/query'
import { FormInput, FormSelect, FormTextarea, Modal, ModalActions, useToast } from '@fuel-carrier/web-ui/ui'
import { z } from 'zod'
import {
  carToFormValues,
  createCar,
  updateCar,
} from '../../../lib/api/cars'

const carFormSchema = createInternalCarDtoSchema.omit({ companyId: true }).extend({
  driverId: z
    .union([z.literal(''), z.uuid()])
    .transform((value) => value || null),
})

type CarFormInput = z.input<typeof carFormSchema>
type CarFormOutput = z.output<typeof carFormSchema>

type CarFormModalMode = 'create' | 'edit'

interface CarFormModalProps {
  mode: CarFormModalMode
  companyId: string
  drivers: Driver[]
  car?: Car
  onClose: () => void
  onSuccess: () => void
}

export function CarFormModal({
  mode,
  companyId,
  drivers,
  car,
  onClose,
  onSuccess,
}: CarFormModalProps) {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<CarFormInput, unknown, CarFormOutput>({
    resolver: zodResolver(carFormSchema),
    defaultValues: carToFormValues(car),
  })

  const {
    setError,
    formState: { isSubmitting },
  } = form

  const saveMutation = useMutation({
    mutationFn: async function saveCar(data: CarFormOutput) {
      const payload: CreateInternalCarDto = {
        ...data,
        companyId,
      }

      if (mode === 'edit' && car) {
        return updateCar(car.id, {
          name: data.name,
          licensePlate: data.licensePlate,
          note: data.note,
          driverId: data.driverId,
          companyId,
          expectedDriverId: car.driverId,
        })
      }

      return createCar(payload)
    },
    onSuccess: function handleSaveSuccess() {
      toast.success(
        mode === 'edit'
          ? LL.internalPanel.toast.carUpdated()
          : LL.internalPanel.toast.carCreated(),
      )
      onSuccess()
      onClose()
    },
  })

  const onSubmit: SubmitHandler<CarFormOutput> = async function onSubmit(
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
          fields: ['name', 'licensePlate', 'note', 'driverId'],
          messages: {
            licensePlate: () =>
              LL.internalPanel.companies.detail.duplicateLicensePlate(),
          },
          fallbackMessage: LL.internalPanel.companies.detail.createFailed(),
        }),
      )
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
      ? LL.internalPanel.companies.detail.carEditTitle()
      : LL.internalPanel.companies.detail.carCreateTitle()

  const confirmLabel =
    mode === 'edit'
      ? LL.internalPanel.companies.update()
      : LL.internalPanel.companies.detail.addCar()

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
          confirmForm="car-form"
          loading={isSaving}
          loadingLabel={LL.internalPanel.companies.updating()}
          onCancel={handleClose}
          cancelDisabled={isSaving}
        />
      }
    >
      <Form
        form={form}
        id="car-form"
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormInput
          name="licensePlate"
          label={LL.internalPanel.companies.detail.licensePlate()}
          type="text"
        />

        <FormInput name="name" label={LL.internalPanel.companies.name()} type="text" />

        <FormSelect
          name="driverId"
          label={LL.internalPanel.companies.detail.driver()}
        >
          <option value="">
            {LL.internalPanel.companies.detail.noDriver()}
          </option>
          {drivers.map(function renderDriverOption(driver) {
            return (
              <option key={driver.id} value={driver.id}>
                {driver.firstName} {driver.lastName}
              </option>
            )
          })}
        </FormSelect>

        <FormTextarea
          name="note"
          label={LL.internalPanel.companies.note()}
          rows={3}
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
