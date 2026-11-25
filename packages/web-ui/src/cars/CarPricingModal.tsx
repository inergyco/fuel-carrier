import { useMemo, useState } from 'react'
import type { TranslationFunctions } from '@fuel-carrier/i18n'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { CarFuelConfigFieldErrors } from '@fuel-carrier/shared-types'
import type { Car } from '@fuel-carrier/shared-types'
import {
  CAR_PRICING_KEYS,
  createUpdateCarPricingDtoSchema,
  type UpdateCarPricingDto,
  type UpdateCarPricingFormInput,
} from '@fuel-carrier/shared-validation/car/pricing'
import type { UseFormSetError } from 'react-hook-form'
import { applyApiFieldErrors, isApiClientError } from '../api'
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
    () =>
      createUpdateCarPricingDtoSchema({
        numberInvalid: LL.validation.companyPricingNumberInvalid(),
        numberNegative: LL.validation.companyPricingNumberNegative(),
        pricingIncomplete: LL.validation.companyPricingIncomplete(),
        feeThresholdOrder: LL.validation.companyPricingFeeThresholdOrder(),
      }),
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
      setServerError(applyPricingSaveError(error, setError, LL))
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

function applyPricingSaveError(
  error: unknown,
  setError: UseFormSetError<UpdateCarPricingFormInput>,
  LL: TranslationFunctions,
): string | null {
  if (hasFirmwareIdentityError(error)) {
    return LL.common.companyPricing.firmwareIdentityRequired()
  }

  return applyApiFieldErrors({
    error,
    setError,
    fields: CAR_PRICING_KEYS,
    codes: {
      [CarFuelConfigFieldErrors.INCOMPLETE]: () =>
        LL.validation.companyPricingIncomplete(),
      [CarFuelConfigFieldErrors.PRICE_RANGE]:
        LL.common.companyPricing.priceRange,
      [CarFuelConfigFieldErrors.WAGE_RANGE]: LL.common.companyPricing.wageRange,
      [CarFuelConfigFieldErrors.THRESHOLD_RANGE]:
        LL.common.companyPricing.thresholdRange,
      [CarFuelConfigFieldErrors.THRESHOLD_ORDER]: () =>
        LL.validation.companyPricingFeeThresholdOrder(),
    },
    fallbackMessage: LL.common.companyPricing.saveFailed(),
  })
}

const hasFirmwareIdentityError = (error: unknown) =>
  isApiClientError(error) &&
  (error.apiError.fields ?? []).some(
    (field) => field.field === 'firmwareIdentity',
  )
