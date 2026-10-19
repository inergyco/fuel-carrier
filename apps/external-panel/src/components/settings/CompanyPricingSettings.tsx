import { useMemo, useState } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  createUpdateCompanyPricingDtoSchema,
  type UpdateCompanyPricingDto,
} from '@fuel-carrier/shared-validation/company/pricing'
import { applyApiFieldErrors } from '@fuel-carrier/web-ui/api'
import {
  Form,
  useForm,
  zodResolver,
  type SubmitHandler,
} from '@fuel-carrier/web-ui/form'
import { useMutation, useQuery, useQueryClient } from '@fuel-carrier/web-ui/query'
import {
  Button,
  CompanyPricingFields,
  companyPricingToFormValues,
  emptyCompanyPricingFormValues,
  useToast,
  type CompanyPricingFormValues,
} from '@fuel-carrier/web-ui/ui'
import type { z } from 'zod'
import {
  companyKeys,
  fetchCompany,
  updateCompanyPricing,
} from '../../lib/api/company'

type PricingFormInput = z.input<
  ReturnType<typeof createUpdateCompanyPricingDtoSchema>
>

export function CompanyPricingSettings() {
  const { LL } = useI18nContext()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const companyQuery = useQuery({
    queryKey: companyKeys.detail,
    queryFn: fetchCompany,
  })

  const pricingSchema = useMemo(
    function createSchema() {
      return createUpdateCompanyPricingDtoSchema({
        numberInvalid: LL.validation.companyPricingNumberInvalid(),
        numberNegative: LL.validation.companyPricingNumberNegative(),
        pricingIncomplete: LL.validation.companyPricingIncomplete(),
        feeThresholdOrder: LL.validation.companyPricingFeeThresholdOrder(),
      })
    },
    [LL],
  )

  const form = useForm<PricingFormInput, unknown, UpdateCompanyPricingDto>({
    resolver: zodResolver(pricingSchema),
    values: companyQuery.data
      ? companyPricingToFormValues(companyQuery.data)
      : emptyCompanyPricingFormValues(),
  })

  const {
    setError,
    formState: { isSubmitting },
  } = form

  const saveMutation = useMutation({
    mutationFn: updateCompanyPricing,
    onSuccess: async function handlePricingSaved() {
      await queryClient.invalidateQueries({ queryKey: companyKeys.all })
      toast.success(LL.externalPanel.toast.pricingUpdated())
      setServerError(null)
    },
  })

  const onSubmit: SubmitHandler<UpdateCompanyPricingDto> =
    async function onSubmit(data) {
      setServerError(null)

      try {
        await saveMutation.mutateAsync(data)
      } catch (error) {
        setServerError(
          applyApiFieldErrors({
            error,
            setError,
            fields: [
              'petrolPricePerLiter',
              'feeThresholdX',
              'feeThresholdY',
              'feeThresholdZ',
              'feeUpToX',
              'feeXToY',
              'feeYToZ',
              'feeAboveZ',
            ] satisfies (keyof CompanyPricingFormValues)[],
            fallbackMessage: LL.common.companyPricing.saveFailed(),
          }),
        )
      }
    }

  const isSaving = isSubmitting || saveMutation.isPending
  const isLoading = companyQuery.isLoading

  return (
    <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-xl sm:p-6">
      {companyQuery.isError ? (
        <p className="text-sm text-error">
          {LL.common.queryError.loadFailed()}
        </p>
      ) : (
        <Form
          form={form}
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <CompanyPricingFields />

          {serverError ? (
            <div className="rounded-lg border border-error/20 bg-error/8 px-3 py-2 text-xs text-error">
              {serverError}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving || isLoading}>
              {isSaving
                ? LL.common.companyPricing.saving()
                : LL.common.companyPricing.save()}
            </Button>
          </div>
        </Form>
      )}
    </section>
  )
}
