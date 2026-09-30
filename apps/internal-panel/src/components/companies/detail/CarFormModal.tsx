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
import {
  FormInput,
  FormSelect,
  FormTextarea,
  Modal,
  ModalActions,
  useToast,
} from '@fuel-carrier/web-ui/ui'
import { z } from 'zod'
import {
  carToFormValues,
  createCar,
  updateCar,
} from '../../../lib/api/cars'

const carCreateFormSchema = createInternalCarDtoSchema.omit({ companyId: true })
const carEditFormSchema = carCreateFormSchema.omit({ driverId: true })

type CarFormInput =
  | z.input<typeof carCreateFormSchema>
  | z.input<typeof carEditFormSchema>
type CarFormOutput =
  | z.output<typeof carCreateFormSchema>
  | z.output<typeof carEditFormSchema>

type CarFormModalMode = 'create' | 'edit'

interface CarFormModalProps {
  mode: CarFormModalMode
  companyId: string
  drivers: Driver[]
  car?: Car
  onClose: () => void
  onSuccess: () => void
}

function isUnassignedDriver(driver: Driver): boolean {
  return !driver.car
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
  const detail = LL.internalPanel.companies.detail
  const freeDrivers = drivers.filter(isUnassignedDriver)
  const schema = mode === 'create' ? carCreateFormSchema : carEditFormSchema
  const defaults = carToFormValues(car)

  const form = useForm<CarFormInput, unknown, CarFormOutput>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'create'
        ? defaults
        : {
            name: defaults.name,
            licensePlate: defaults.licensePlate,
            note: defaults.note,
          },
  })

  const {
    setError,
    formState: { isSubmitting },
  } = form

  const saveMutation = useMutation({
    mutationFn: async function saveCar(data: CarFormOutput) {
      if (mode === 'edit' && car) {
        return updateCar(car.id, {
          name: data.name,
          licensePlate: data.licensePlate,
          note: data.note,
          companyId,
        })
      }

      const payload: CreateInternalCarDto = {
        ...(data as z.output<typeof carCreateFormSchema>),
        companyId,
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
            licensePlate: () => detail.duplicateLicensePlate(),
          },
          fallbackMessage: detail.createFailed(),
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
    mode === 'edit' ? detail.carEditTitle() : detail.carCreateTitle()
  const confirmLabel =
    mode === 'edit'
      ? LL.internalPanel.companies.update()
      : detail.addCar()

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
          label={detail.licensePlate()}
          type="text"
        />

        <FormInput
          name="name"
          label={LL.internalPanel.companies.name()}
          type="text"
        />

        {mode === 'create' ? (
          <FormSelect name="driverId" label={detail.driver()}>
            <option value="">{detail.selectDriver()}</option>
            {freeDrivers.map(function renderDriverOption(driver) {
              return (
                <option key={driver.id} value={driver.id}>
                  {driver.firstName} {driver.lastName}
                </option>
              )
            })}
          </FormSelect>
        ) : null}

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
