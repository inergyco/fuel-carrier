import { z } from 'zod';
import { optionalTextField } from '../optional-text-field';
import type { CreateCompanyValidationMessages } from './create-company.dto';
import {
  IMAGE_UPLOAD_URL_MAX_LENGTH,
  isAllowedCompanyLogoUrl,
} from '../image-upload/constants';
import {
  COMPANY_ADDRESS_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_NATIONAL_ID_MAX_LENGTH,
  COMPANY_NOTE_MAX_LENGTH,
  COMPANY_PHONE_MAX_LENGTH,
} from './constants';
import {
  optionalCompanyPricingObjectSchema,
  refineCompanyPricing,
} from './company-pricing';

/**
 * Update body: omitted keys stay undefined (leave unchanged).
 * Logo changes go through `replaceCompanyLogoDtoSchema` / replaceLogo only —
 * so generic PATCH never owns filesystem cleanup.
 * Do not reuse createCompanyDtoSchema — required fields + optionalTextField
 * preprocess would invent nulls for omitted address/note.
 */
export function createUpdateCompanyDtoSchema(
  messages: CreateCompanyValidationMessages,
) {
  const pricing = optionalCompanyPricingObjectSchema(messages);

  return z
    .object({
      name: z
        .string()
        .min(1, messages.nameRequired)
        .max(COMPANY_NAME_MAX_LENGTH, messages.nameTooLong)
        .optional(),
      nationalId: z
        .string()
        .min(1, messages.nationalIdRequired)
        .max(COMPANY_NATIONAL_ID_MAX_LENGTH, messages.nationalIdTooLong)
        .optional(),
      phoneNumber: z
        .string()
        .min(1, messages.phoneNumberRequired)
        .max(COMPANY_PHONE_MAX_LENGTH, messages.phoneNumberTooLong)
        .optional(),
      address: optionalTextField(
        COMPANY_ADDRESS_MAX_LENGTH,
        messages.addressTooLong,
      ).optional(),
      note: optionalTextField(
        COMPANY_NOTE_MAX_LENGTH,
        messages.noteTooLong,
      ).optional(),
      petrolPricePerLiter: pricing.shape.petrolPricePerLiter,
      feeThresholdX: pricing.shape.feeThresholdX,
      feeThresholdY: pricing.shape.feeThresholdY,
      feeThresholdZ: pricing.shape.feeThresholdZ,
      feeUpToX: pricing.shape.feeUpToX,
      feeXToY: pricing.shape.feeXToY,
      feeYToZ: pricing.shape.feeYToZ,
      feeAboveZ: pricing.shape.feeAboveZ,
    })
    .strict()
    .superRefine((data, ctx) => {
      refineCompanyPricing(data, ctx, messages);
    });
}

const defaultMessages: CreateCompanyValidationMessages = {
  nameRequired: 'Company name is required',
  nameTooLong: `Company name must be at most ${COMPANY_NAME_MAX_LENGTH} characters`,
  nationalIdRequired: 'National ID is required',
  nationalIdTooLong: `National ID must be at most ${COMPANY_NATIONAL_ID_MAX_LENGTH} characters`,
  phoneNumberRequired: 'Phone number is required',
  phoneNumberTooLong: `Phone number must be at most ${COMPANY_PHONE_MAX_LENGTH} characters`,
  addressTooLong: `Address must be at most ${COMPANY_ADDRESS_MAX_LENGTH} characters`,
  noteTooLong: `Note must be at most ${COMPANY_NOTE_MAX_LENGTH} characters`,
  logoUrlTooLong: `Logo URL must be at most ${IMAGE_UPLOAD_URL_MAX_LENGTH} characters`,
  logoUrlInvalid: 'Logo URL must be a valid URL',
  numberInvalid: 'Must be a valid number',
  numberNegative: 'Must be zero or greater',
  pricingIncomplete:
    'Petrol price and all fee range fields must be set together',
  feeThresholdOrder: 'Fee thresholds must satisfy 0 < x < y < z',
};

export const updateCompanyDtoSchema =
  createUpdateCompanyDtoSchema(defaultMessages);

export type UpdateCompanyDto = z.infer<typeof updateCompanyDtoSchema>;

/** Explicit logo replace — clear via DELETE …/logo. */
export const replaceCompanyLogoDtoSchema = z.object({
  logoUrl: z
    .string()
    .max(IMAGE_UPLOAD_URL_MAX_LENGTH, defaultMessages.logoUrlTooLong)
    .refine(isAllowedCompanyLogoUrl, defaultMessages.logoUrlInvalid),
});

export type ReplaceCompanyLogoDto = z.infer<typeof replaceCompanyLogoDtoSchema>;
