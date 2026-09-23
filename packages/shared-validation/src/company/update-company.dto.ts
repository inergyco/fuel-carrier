import { z } from 'zod';
import { optionalTextField } from '../optional-text-field';
import type { CreateCompanyValidationMessages } from './create-company.dto';
import {
  COMPANY_ADDRESS_MAX_LENGTH,
  COMPANY_LOGO_URL_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_NATIONAL_ID_MAX_LENGTH,
  COMPANY_NOTE_MAX_LENGTH,
  COMPANY_PHONE_MAX_LENGTH,
} from './constants';

/**
 * Update body: omitted keys stay undefined (leave unchanged).
 * Do not reuse createCompanyDtoSchema — required fields + optionalTextField
 * preprocess would invent nulls for omitted address/note/logoUrl.
 */
export function createUpdateCompanyDtoSchema(
  messages: CreateCompanyValidationMessages,
) {
  return z.object({
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
    logoUrl: z.preprocess(
      function normalizeLogoUrl(value) {
        if (value === undefined) {
          return undefined;
        }

        if (value == null) {
          return null;
        }

        if (typeof value === 'string' && value.trim().length === 0) {
          return null;
        }

        return value;
      },
      z.union([
        z.undefined(),
        z.null(),
        z
          .string()
          .max(COMPANY_LOGO_URL_MAX_LENGTH, messages.logoUrlTooLong)
          .url(messages.logoUrlInvalid),
      ]),
    ),
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
  logoUrlTooLong: `Logo URL must be at most ${COMPANY_LOGO_URL_MAX_LENGTH} characters`,
  logoUrlInvalid: 'Logo URL must be a valid URL',
};

export const updateCompanyDtoSchema =
  createUpdateCompanyDtoSchema(defaultMessages);

export type UpdateCompanyDto = z.infer<typeof updateCompanyDtoSchema>;
