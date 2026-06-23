import { useState } from 'react'
import type { Car } from '@fuel-carrier/shared-types'
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
import { carToFormValues, createCar, updateCar } from '../../lib/api/cars'
import {
  carFormSchema,
  type CarFormInput,
  type CarFormModalMode,
  type CarFormOutput,
} from './car-form.schema'

interface UseCarFormModalOptions {
  mode: CarFormModalMode
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
  car,
  onClose,
  onSuccess,
}: UseCarFormModalOptions): UseCarFormModalResult {
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
      if (mode === 'edit' && car) {
        return updateCar(car.id, data)
      }

      return createCar(data)
    },
    onSuccess: function handleSaveSuccess() {
      toast.success(
        mode === 'edit'
          ? LL.externalPanel.toast.carUpdated()
          : LL.externalPanel.toast.carCreated(),
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
    if (isApiClientError(error)) {
      if (error.apiError.fields?.length) {
        for (const fieldError of error.apiError.fields) {
          if (
            fieldError.field === 'name' ||
            fieldError.field === 'licensePlate' ||
            fieldError.field === 'note' ||
            fieldError.field === 'driverId'
          ) {
            setError(fieldError.field, { message: fieldError.message })
          }
        }
      }

      if (
        error.apiError.fields?.some((field) => field.field === 'licensePlate')
      ) {
        setServerError(LL.externalPanel.cars.duplicateLicensePlate())
        return
      }

      setServerError(error.apiError.message)
      return
    }

    setServerError(LL.externalPanel.cars.createFailed())
  }

  function handleClose() {
    if (!isSubmitting && !saveMutation.isPending) {
      onClose()
    }
  }

  const isSaving = isSubmitting || saveMutation.isPending
  const title =
    mode === 'edit'
      ? LL.externalPanel.cars.editTitle()
      : LL.externalPanel.cars.createTitle()

  const confirmLabel =
    mode === 'edit'
      ? LL.externalPanel.cars.update()
      : LL.externalPanel.cars.addCar()

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
