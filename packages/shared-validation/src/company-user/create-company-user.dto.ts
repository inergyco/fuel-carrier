import type { CompanyUserInput } from '@fuel-carrier/shared-types';
import { COMPANY_USER_LEVELS } from '@fuel-carrier/shared-types';
import { z } from 'zod';
import {
  createStrongPasswordSchema,
  type PasswordStrengthMessages,
} from '../admin/login.dto';
import { optionalTextField } from '../optional-text-field';
import {
  IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
  IRANIAN_NATIONAL_ID_LENGTH,
  optionalIranianNationalIdSchema,
} from '../national-id';
import { PASSWORD_MIN_LENGTH, strongPasswordSchema } from '../password';
import { isValidUsername } from '../username';

export const COMPANY_USER_FIRST_NAME_MAX_LENGTH = 100;
export const COMPANY_USER_LAST_NAME_MAX_LENGTH = 100;
export const COMPANY_USER_NATIONAL_ID_MAX_LENGTH = IRANIAN_NATIONAL_ID_LENGTH;
export const COMPANY_USER_EMAIL_MAX_LENGTH = 254;

const companyUserLevelSchema = z.enum(COMPANY_USER_LEVELS);

export type CompanyUserValidationMessages = {
  firstNameRequired: string;
  firstNameTooLong: string;
  lastNameRequired: string;
  lastNameTooLong: string;
  usernameRequired: string;
  usernameInvalid: string;
  nationalIdInvalid: string;
  emailTooLong: string;
  passwordRequired: string;
  passwordStrength: PasswordStrengthMessages;
};

const defaultCompanyUserValidationMessages: CompanyUserValidationMessages = {
  firstNameRequired: 'First name is required',
  firstNameTooLong: `First name must be at most ${COMPANY_USER_FIRST_NAME_MAX_LENGTH} characters`,
  lastNameRequired: 'Last name is required',
  lastNameTooLong: `Last name must be at most ${COMPANY_USER_LAST_NAME_MAX_LENGTH} characters`,
  usernameRequired: 'Username is required',
  usernameInvalid:
    'Username must be 3–32 characters and contain only letters, numbers, underscores, and hyphens',
  nationalIdInvalid: IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
  emailTooLong: `Email must be at most ${COMPANY_USER_EMAIL_MAX_LENGTH} characters`,
  passwordRequired: 'Password is required',
  passwordStrength: {
    minLength: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    uppercase: 'Password must contain at least one uppercase letter',
    lowercase: 'Password must contain at least one lowercase letter',
    digit: 'Password must contain at least one number',
    special: 'Password must contain at least one special character',
  },
};

export function createCompanyUserBaseSchema(
  messages: CompanyUserValidationMessages = defaultCompanyUserValidationMessages,
) {
  return z.object({
    firstName: z
      .string()
      .min(1, messages.firstNameRequired)
      .max(COMPANY_USER_FIRST_NAME_MAX_LENGTH, messages.firstNameTooLong),
    lastName: z
      .string()
      .min(1, messages.lastNameRequired)
      .max(COMPANY_USER_LAST_NAME_MAX_LENGTH, messages.lastNameTooLong),
    username: z
      .string()
      .min(1, messages.usernameRequired)
      .refine(isValidUsername, { message: messages.usernameInvalid }),
    level: companyUserLevelSchema,
    nationalId: optionalIranianNationalIdSchema(
      messages.nationalIdInvalid,
    ).optional(),
    email: optionalTextField(
      COMPANY_USER_EMAIL_MAX_LENGTH,
      messages.emailTooLong,
    ).optional(),
  });
}

export function createCompanyUserPasswordSchema(
  messages: CompanyUserValidationMessages = defaultCompanyUserValidationMessages,
) {
  return z
    .string()
    .min(1, messages.passwordRequired)
    .pipe(createStrongPasswordSchema(messages.passwordStrength));
}

export function createCompanyUserFormSchemas(
  messages: CompanyUserValidationMessages = defaultCompanyUserValidationMessages,
) {
  const passwordSchema = createCompanyUserPasswordSchema(messages);
  const createSchema = createCompanyUserBaseSchema(messages).extend({
    password: passwordSchema,
  });

  return {
    createSchema,
    editSchema: createSchema.extend({
      password: z.union([z.literal(''), passwordSchema]),
    }),
  };
}

const companyUserBaseSchema = createCompanyUserBaseSchema();

/** Internal admin: companyId is required in the request body. */
export const createInternalCompanyUserDtoSchema = companyUserBaseSchema.extend({
  companyId: z.uuid(),
  password: strongPasswordSchema,
});

/** Company user: companyId is taken from the JWT, not the request body. */
export const createExternalCompanyUserDtoSchema = companyUserBaseSchema.extend({
  password: strongPasswordSchema,
});

export const updateInternalCompanyUserDtoSchema =
  createInternalCompanyUserDtoSchema.partial();
export const updateExternalCompanyUserDtoSchema =
  createExternalCompanyUserDtoSchema.partial();

export type CreateInternalCompanyUserDto = CompanyUserInput;
export type CreateExternalCompanyUserDto = Omit<CompanyUserInput, 'companyId'>;
export type UpdateInternalCompanyUserDto = Partial<
  Omit<CompanyUserInput, 'companyId' | 'password'>
> & {
  password?: string;
};
export type UpdateExternalCompanyUserDto = Partial<
  Omit<CreateExternalCompanyUserDto, 'password'>
> & {
  password?: string;
};
