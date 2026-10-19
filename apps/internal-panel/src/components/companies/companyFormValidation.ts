import type { TranslationFunctions } from '@fuel-carrier/i18n'
import type { Company } from '@fuel-carrier/shared-types'
import {
  COMPANY_ADDRESS_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_NATIONAL_ID_MAX_LENGTH,
  COMPANY_NOTE_MAX_LENGTH,
  COMPANY_PHONE_MAX_LENGTH,
} from '@fuel-carrier/shared-validation/company/constants'
import {
  createCreateCompanyDtoSchema,
  type CreateCompanyValidationMessages,
} from '@fuel-carrier/shared-validation/company/create'
import { COMPANY_PRICING_KEYS } from '@fuel-carrier/shared-validation/company/pricing'
import { IMAGE_UPLOAD_URL_MAX_LENGTH } from '@fuel-carrier/shared-validation/image-upload/constants'
import type { z } from 'zod'

export type CompanyFormMode = 'create' | 'edit'

export type CompanyFormInput = z.input<
  ReturnType<typeof createCreateCompanyDtoSchema>
>

export const COMPANY_FORM_FIELDS = [
  'name',
  'nationalId',
  'phoneNumber',
  'address',
  'note',
  'logoUrl',
  ...COMPANY_PRICING_KEYS,
] as const satisfies readonly (keyof CompanyFormInput)[]

export interface CompanyFormProps {
  mode: CompanyFormMode
  company?: Company
  onCancel: () => void
  onSaved: (company: Company) => void
}

export const toCompanyFormValidationMessages = (
  LL: TranslationFunctions,
): CreateCompanyValidationMessages => ({
  nameRequired: LL.validation.companyNameRequired(),
  nameTooLong: LL.validation.companyNameTooLong({
    max: COMPANY_NAME_MAX_LENGTH,
  }),
  nationalIdRequired: LL.validation.companyNationalIdRequired(),
  nationalIdTooLong: LL.validation.companyNationalIdTooLong({
    max: COMPANY_NATIONAL_ID_MAX_LENGTH,
  }),
  phoneNumberRequired: LL.validation.companyPhoneNumberRequired(),
  phoneNumberTooLong: LL.validation.companyPhoneNumberTooLong({
    max: COMPANY_PHONE_MAX_LENGTH,
  }),
  addressTooLong: LL.validation.companyAddressTooLong({
    max: COMPANY_ADDRESS_MAX_LENGTH,
  }),
  noteTooLong: LL.validation.companyNoteTooLong({
    max: COMPANY_NOTE_MAX_LENGTH,
  }),
  logoUrlTooLong: LL.validation.companyLogoUrlTooLong({
    max: IMAGE_UPLOAD_URL_MAX_LENGTH,
  }),
  logoUrlInvalid: LL.validation.companyLogoUrlInvalid(),
  numberInvalid: LL.validation.companyPricingNumberInvalid(),
  numberNegative: LL.validation.companyPricingNumberNegative(),
  pricingIncomplete: LL.validation.companyPricingIncomplete(),
  feeThresholdOrder: LL.validation.companyPricingFeeThresholdOrder(),
})
