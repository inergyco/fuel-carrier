import { useMemo, useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { CreateInternalCarDto } from '@fuel-carrier/shared-validation/car/create'
import { applyApiFieldErrors } from '@fuel-carrier/web-ui/api'
import {
  zodResolver,
  useForm,
  toCarValidationMessages,
  type SubmitHandler,
  type UseFormReturn,
} from '@fuel-carrier/web-ui/form'
import { useMutation } from '@fuel-carrier/web-ui/query'
import { useToast } from '@fuel-carrier/web-ui/ui'
import { carToFormValues, createCar, updateCar } from '../../../lib/api/cars'
import {
  createCarFormSchemaPair,
  type CarFormInput,
  type CarFormModalMode,
  type CarFormOutput,
  type CreateCarFormOutput,
} from './car-form.schema'

interface UseCarFormModalOptions {
  mode: CarFormModalMode
  companyId: string
  car?: Car
  onClose: () => void
  onSuccess: () => void
}

interface UseCarFormModalResult {
  form: UseFormReturn<CarFormInput, unknown, CarFormOutput>
  serverError: string | null
  isSaving: boolean
  title: string
  confirmLabel: string
  onSubmit: SubmitHandler<CarFormOutput>
  handleClose: () => void
}

export function useCarFormModal({
  mode,
  companyId,
  car,
  onClose,
  onSuccess,
}: UseCarFormModalOptions): UseCarFormModalResult {
  const { LL } = useI18nContext()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const detail = LL.internalPanel.companies.detail
  const schema = useMemo(
    function createSchema() {
      const schemas = createCarFormSchemaPair(toCarValidationMessages(LL))

      return mode === 'create' ? schemas.createSchema : schemas.editSchema
    },
    [LL, mode],
  )
  const defaults = carToFormValues(car)

  const form = useForm<CarFormInput, unknown, CarFormOutput>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === 'create'
        ? defaults
        : {
            licensePlate: defaults.licensePlate,
            note: defaults.note,
            hasHighGrade: defaults.hasHighGrade,
            tankCount: defaults.tankCount,
            tankCapacityLiters: defaults.tankCapacityLiters,
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
          licensePlate: data.licensePlate,
          note: data.note,
          hasHighGrade: data.hasHighGrade,
          tankCount: data.tankCount,
          tankCapacityLiters: data.tankCapacityLiters,
          companyId,
        })
      }

      const payload: CreateInternalCarDto = {
        ...(data as CreateCarFormOutput),
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

  const onSubmit: SubmitHandler<CarFormOutput> = async function onSubmit(data) {
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
        fields: [
          'licensePlate',
          'note',
          'driverId',
          'tankCount',
          'tankCapacityLiters',
        ],
        messages: {
          licensePlate: () => detail.duplicateLicensePlate(),
        },
        fallbackMessage: detail.createFailed(),
      }),
    )
  }

  function handleClose() {
    if (!isSubmitting && !saveMutation.isPending) {
      onClose()
    }
  }

  const isSaving = isSubmitting || saveMutation.isPending
  const title = mode === 'edit' ? detail.carEditTitle() : detail.carCreateTitle()
  const confirmLabel =
    mode === 'edit' ? LL.internalPanel.companies.update() : detail.addCar()

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
