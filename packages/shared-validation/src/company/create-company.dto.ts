import type { CompanyInput } from '@fuel-carrier/shared-types';
import { z } from 'zod';
import { optionalTextField } from '../optional-text-field';
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
  companyPricingObjectSchema,
  refineCompanyPricing,
  type CompanyPricingValidationMessages,
} from './company-pricing';

export type CreateCompanyValidationMessages = {
  nameRequired: string;
  nameTooLong: string;
  nationalIdRequired: string;
  nationalIdTooLong: string;
  phoneNumberRequired: string;
  phoneNumberTooLong: string;
  addressTooLong: string;
  noteTooLong: string;
  logoUrlTooLong: string;
  logoUrlInvalid: string;
} & CompanyPricingValidationMessages;

export function createCreateCompanyDtoSchema(
  messages: CreateCompanyValidationMessages,
) {
  const pricing = companyPricingObjectSchema(messages);

  return z
    .object({
      name: z
        .string()
        .min(1, messages.nameRequired)
        .max(COMPANY_NAME_MAX_LENGTH, messages.nameTooLong),
      nationalId: z
        .string()
        .min(1, messages.nationalIdRequired)
        .max(COMPANY_NATIONAL_ID_MAX_LENGTH, messages.nationalIdTooLong),
      phoneNumber: z
        .string()
        .min(1, messages.phoneNumberRequired)
        .max(COMPANY_PHONE_MAX_LENGTH, messages.phoneNumberTooLong),
      address: optionalTextField(
        COMPANY_ADDRESS_MAX_LENGTH,
        messages.addressTooLong,
      ),
      note: optionalTextField(COMPANY_NOTE_MAX_LENGTH, messages.noteTooLong),
      logoUrl: optionalTextField(
        IMAGE_UPLOAD_URL_MAX_LENGTH,
        messages.logoUrlTooLong,
      ).pipe(
        z.union([
          z.null(),
          z.string().refine(isAllowedCompanyLogoUrl, messages.logoUrlInvalid),
        ]),
      ),
      petrolPricePerLiter: pricing.shape.petrolPricePerLiter,
      feeThresholdX: pricing.shape.feeThresholdX,
      feeThresholdY: pricing.shape.feeThresholdY,
      feeThresholdZ: pricing.shape.feeThresholdZ,
      feeUpToX: pricing.shape.feeUpToX,
      feeXToY: pricing.shape.feeXToY,
      feeYToZ: pricing.shape.feeYToZ,
      feeAboveZ: pricing.shape.feeAboveZ,
    })
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

export const createCompanyDtoSchema =
  createCreateCompanyDtoSchema(defaultMessages);

export type CreateCompanyDto = CompanyInput;
