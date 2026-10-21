import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { ReactNode } from 'react'
import type { FieldValues } from 'react-hook-form'
import { FieldsetLegend } from './FieldsetLegend'
import { FormInput } from './FormInput'

const THRESHOLD_FIELDS = [
  'feeThresholdX',
  'feeThresholdY',
  'feeThresholdZ',
] as const

const FEE_FIELDS = [
  'feeUpToX',
  'feeXToY',
  'feeYToZ',
  'feeAboveZ',
] as const

const PRICING_FIELDS = [
  'petrolPricePerLiter',
  ...THRESHOLD_FIELDS,
  ...FEE_FIELDS,
] as const

type PricingFieldName = (typeof PRICING_FIELDS)[number]

interface CompanyPricingFieldsProps {
  /** Hide the section title when the parent already provides one. */
  showHeading?: boolean
}

export function CompanyPricingFields({
  showHeading = true,
}: CompanyPricingFieldsProps) {
  const { LL } = useI18nContext()
  const labels = LL.common.companyPricing

  const fieldLabels: Record<PricingFieldName, string> = {
    petrolPricePerLiter: labels.petrolPricePerLiter(),
    feeThresholdX: labels.feeThresholdX(),
    feeThresholdY: labels.feeThresholdY(),
    feeThresholdZ: labels.feeThresholdZ(),
    feeUpToX: labels.feeUpToX(),
    feeXToY: labels.feeXToY(),
    feeYToZ: labels.feeYToZ(),
    feeAboveZ: labels.feeAboveZ(),
  }

  function renderNumberField(name: PricingFieldName) {
    return (
      <FormInput<FieldValues>
        key={name}
        name={name}
        label={fieldLabels[name]}
        type="number"
        inputMode="decimal"
        step="any"
        min={0}
        dir="ltr"
      />
    )
  }

  function renderGroup(title: string, children: ReactNode) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-base-content/8 bg-base-100/30 p-4">
        <p className="text-xs font-bold tracking-widest text-base-content/40 uppercase">
          {title}
        </p>
        {children}
      </div>
    )
  }

  return (
    <fieldset className="flex flex-col gap-5">
      {showHeading ? (
        <FieldsetLegend description={labels.subtitle()}>
          {labels.title()}
        </FieldsetLegend>
      ) : null}

      {renderGroup(
        labels.priceGroup(),
        <div className="">
          {renderNumberField('petrolPricePerLiter')}
        </div>,
      )}

      {renderGroup(
        labels.thresholdsGroup(),
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {THRESHOLD_FIELDS.map(renderNumberField)}
        </div>,
      )}

      {renderGroup(
        labels.feesGroup(),
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEE_FIELDS.map(renderNumberField)}
        </div>,
      )}
    </fieldset>
  )
}

export type CompanyPricingFormValues = Record<
  PricingFieldName,
  string | number | null
>

export function emptyCompanyPricingFormValues(): CompanyPricingFormValues {
  return {
    petrolPricePerLiter: '',
    feeThresholdX: '',
    feeThresholdY: '',
    feeThresholdZ: '',
    feeUpToX: '',
    feeXToY: '',
    feeYToZ: '',
    feeAboveZ: '',
  }
}

export function companyPricingToFormValues(pricing: {
  petrolPricePerLiter: number | null
  feeThresholdX: number | null
  feeThresholdY: number | null
  feeThresholdZ: number | null
  feeUpToX: number | null
  feeXToY: number | null
  feeYToZ: number | null
  feeAboveZ: number | null
}): CompanyPricingFormValues {
  return {
    petrolPricePerLiter: pricing.petrolPricePerLiter ?? '',
    feeThresholdX: pricing.feeThresholdX ?? '',
    feeThresholdY: pricing.feeThresholdY ?? '',
    feeThresholdZ: pricing.feeThresholdZ ?? '',
    feeUpToX: pricing.feeUpToX ?? '',
    feeXToY: pricing.feeXToY ?? '',
    feeYToZ: pricing.feeYToZ ?? '',
    feeAboveZ: pricing.feeAboveZ ?? '',
  }
}
