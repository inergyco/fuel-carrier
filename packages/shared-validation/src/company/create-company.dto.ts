import type { CompanyInput } from '@fuel-carrier/shared-types';
import { z } from 'zod';
import { optionalTextField } from '../optional-text-field';
import {
  COMPANY_ADDRESS_MAX_LENGTH,
  COMPANY_LOGO_URL_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_NATIONAL_ID_MAX_LENGTH,
  COMPANY_NOTE_MAX_LENGTH,
  COMPANY_PHONE_MAX_LENGTH,
} from './constants';

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
};

export function createCreateCompanyDtoSchema(
  messages: CreateCompanyValidationMessages,
) {
  return z.object({
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
      COMPANY_LOGO_URL_MAX_LENGTH,
      messages.logoUrlTooLong,
    ).pipe(
      z.union([
        z.null(),
        z.string().url(messages.logoUrlInvalid),
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

export const createCompanyDtoSchema =
  createCreateCompanyDtoSchema(defaultMessages);

export type CreateCompanyDto = CompanyInput;
