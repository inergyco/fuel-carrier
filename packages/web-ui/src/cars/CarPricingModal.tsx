import { useMemo, useState } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { Car } from '@fuel-carrier/shared-types'
import {
  CAR_PRICING_KEYS,
  createUpdateCarPricingDtoSchema,
  type UpdateCarPricingDto,
  type UpdateCarPricingFormInput,
} from '@fuel-carrier/shared-validation/car/pricing'
import { applyApiFieldErrors } from '../api'
import {
  Form,
  useForm,
  zodResolver,
  type SubmitHandler,
} from '../form'
import {
  CompanyPricingFields,
  companyPricingToFormValues,
  Modal,
  ModalActions,
} from '../ui'

export type CarPricingModalProps = {
  open: boolean
  car: Car
  onClose: () => void
  savePricing: (dto: UpdateCarPricingDto) => Promise<void>
}

export function CarPricingModal({
  open,
  car,
  onClose,
  savePricing,
}: CarPricingModalProps) {
  const { LL } = useI18nContext()
  const [serverError, setServerError] = useState<string | null>(null)
  const labels = LL.common.companyPricing

  const pricingSchema = useMemo(
    function createSchema() {
      return createUpdateCarPricingDtoSchema({
        numberInvalid: LL.validation.companyPricingNumberInvalid(),
        numberNegative: LL.validation.companyPricingNumberNegative(),
        pricingIncomplete: LL.validation.companyPricingIncomplete(),
        feeThresholdOrder: LL.validation.companyPricingFeeThresholdOrder(),
      })
    },
    [LL],
  )

  const form = useForm<
    UpdateCarPricingFormInput,
    unknown,
    UpdateCarPricingDto
  >({
    resolver: zodResolver(pricingSchema),
    values: companyPricingToFormValues(car),
  })

  const {
    setError,
    reset,
    formState: { isSubmitting },
  } = form

  function handleClose() {
    if (isSubmitting) {
      return
    }

    reset(companyPricingToFormValues(car))
    setServerError(null)
    onClose()
  }

  const onSubmit: SubmitHandler<UpdateCarPricingDto> = async function onSubmit(
    data,
  ) {
    setServerError(null)

    try {
      await savePricing(data)
      setServerError(null)
      onClose()
    } catch (error) {
      setServerError(
        applyApiFieldErrors({
          error,
          setError,
          fields: CAR_PRICING_KEYS,
          fallbackMessage: labels.saveFailed(),
        }),
      )
    }
  }

  return (
    <Modal
      open={open}
      title={labels.title()}
      description={labels.subtitle()}
      onClose={handleClose}
      closeDisabled={isSubmitting}
      size="xl"
      footer={
        <ModalActions
          cancelLabel={LL.common.cancel()}
          confirmLabel={labels.save()}
          confirmType="submit"
          confirmForm="car-pricing-form"
          loading={isSubmitting}
          loadingLabel={labels.saving()}
          onCancel={handleClose}
          cancelDisabled={isSubmitting}
        />
      }
    >
      <Form
        form={form}
        id="car-pricing-form"
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <CompanyPricingFields showHeading={false} />
        {serverError ? (
          <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
            {serverError}
          </div>
        ) : null}
      </Form>
    </Modal>
  )
}
