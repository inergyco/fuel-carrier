import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { FieldValues } from 'react-hook-form'
import { FieldsetLegend } from './FieldsetLegend'
import { FormInput } from './FormInput'

const PRICING_FIELDS = [
  'petrolPricePerLiter',
  'feeThresholdX',
  'feeThresholdY',
  'feeThresholdZ',
  'feeUpToX',
  'feeXToY',
  'feeYToZ',
  'feeAboveZ',
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

  return (
    <fieldset className="flex flex-col gap-4">
      {showHeading ? (
        <FieldsetLegend description={labels.subtitle()}>
          {labels.title()}
        </FieldsetLegend>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRICING_FIELDS.map(function renderPricingField(name) {
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
        })}
      </div>
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
