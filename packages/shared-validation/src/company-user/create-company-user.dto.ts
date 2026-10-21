import type { CompanyUserInput } from '@fuel-carrier/shared-types';
import { COMPANY_USER_LEVELS } from '@fuel-carrier/shared-types';
import { z } from 'zod';
import { optionalTextField } from '../optional-text-field';
import {
  COMPANY_USER_IMAGE_PUBLIC_PREFIX,
  IMAGE_UPLOAD_URL_MAX_LENGTH,
  isAllowedCompanyUserImageUrl,
} from '../image-upload/constants';
import {
  createStrongPasswordSchema,
  type PasswordStrengthMessages,
} from '../admin/login.dto';
import {
  EMAIL_INVALID_MESSAGE,
  optionalEmailSchema,
} from '../email';
import {
  IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
  IRANIAN_NATIONAL_ID_LENGTH,
  optionalIranianNationalIdSchema,
} from '../national-id';
import { PASSWORD_MIN_LENGTH, strongPasswordSchema } from '../password';
import {
  PERSON_NAME_NO_DIGITS_MESSAGE,
  personNameSchema,
} from '../person-name';
import { isValidUsername } from '../username';

export const COMPANY_USER_FIRST_NAME_MAX_LENGTH = 100;
export const COMPANY_USER_LAST_NAME_MAX_LENGTH = 100;
export const COMPANY_USER_NATIONAL_ID_MAX_LENGTH = IRANIAN_NATIONAL_ID_LENGTH;
export const COMPANY_USER_EMAIL_MAX_LENGTH = 254;

const companyUserLevelSchema = z.enum(COMPANY_USER_LEVELS);

export type CompanyUserValidationMessages = {
  firstNameRequired: string;
  firstNameTooLong: string;
  firstNameNoDigits: string;
  lastNameRequired: string;
  lastNameTooLong: string;
  lastNameNoDigits: string;
  usernameRequired: string;
  usernameInvalid: string;
  nationalIdInvalid: string;
  emailTooLong: string;
  emailInvalid: string;
  imageUrlTooLong: string;
  imageUrlInvalid: string;
  passwordRequired: string;
  passwordStrength: PasswordStrengthMessages;
};

const defaultCompanyUserValidationMessages: CompanyUserValidationMessages = {
  firstNameRequired: 'First name is required',
  firstNameTooLong: `First name must be at most ${COMPANY_USER_FIRST_NAME_MAX_LENGTH} characters`,
  firstNameNoDigits: PERSON_NAME_NO_DIGITS_MESSAGE,
  lastNameRequired: 'Last name is required',
  lastNameTooLong: `Last name must be at most ${COMPANY_USER_LAST_NAME_MAX_LENGTH} characters`,
  lastNameNoDigits: PERSON_NAME_NO_DIGITS_MESSAGE,
  usernameRequired: 'Username is required',
  usernameInvalid:
    'Username must be 3–32 characters and contain only letters, numbers, underscores, and hyphens',
  nationalIdInvalid: IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
  emailTooLong: `Email must be at most ${COMPANY_USER_EMAIL_MAX_LENGTH} characters`,
  emailInvalid: EMAIL_INVALID_MESSAGE,
  imageUrlTooLong: `Image URL must be at most ${IMAGE_UPLOAD_URL_MAX_LENGTH} characters`,
  imageUrlInvalid: 'Image URL must be a valid URL',
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
    firstName: personNameSchema({
      requiredMessage: messages.firstNameRequired,
      tooLongMessage: messages.firstNameTooLong,
      noDigitsMessage: messages.firstNameNoDigits,
      maxLength: COMPANY_USER_FIRST_NAME_MAX_LENGTH,
    }),
    lastName: personNameSchema({
      requiredMessage: messages.lastNameRequired,
      tooLongMessage: messages.lastNameTooLong,
      noDigitsMessage: messages.lastNameNoDigits,
      maxLength: COMPANY_USER_LAST_NAME_MAX_LENGTH,
    }),
    username: z
      .string()
      .min(1, messages.usernameRequired)
      .refine(isValidUsername, { message: messages.usernameInvalid }),
    level: companyUserLevelSchema,
    nationalId: optionalIranianNationalIdSchema(
      messages.nationalIdInvalid,
    ).optional(),
    email: optionalEmailSchema(COMPANY_USER_EMAIL_MAX_LENGTH, {
      tooLong: messages.emailTooLong,
      invalid: messages.emailInvalid,
    }).optional(),
    imageUrl: optionalTextField(
      IMAGE_UPLOAD_URL_MAX_LENGTH,
      messages.imageUrlTooLong,
    ).pipe(
      z.union([
        z.null(),
        z
          .string()
          .refine(isAllowedCompanyUserImageUrl, messages.imageUrlInvalid),
      ]),
    ),
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

/**
 * Image changes go through `replaceCompanyUserImageDtoSchema` / replaceImage only —
 * generic PATCH must not touch the filesystem.
 */
export const updateInternalCompanyUserDtoSchema =
  createInternalCompanyUserDtoSchema
    .omit({ imageUrl: true })
    .partial()
    .strict();
export const updateExternalCompanyUserDtoSchema =
  createExternalCompanyUserDtoSchema
    .omit({ imageUrl: true })
    .partial()
    .strict();

/** Explicit image replace — clear via DELETE …/image. */
export const replaceCompanyUserImageDtoSchema = z.object({
  imageUrl: z
    .string()
    .max(
      IMAGE_UPLOAD_URL_MAX_LENGTH,
      `Image URL must be at most ${IMAGE_UPLOAD_URL_MAX_LENGTH} characters`,
    )
    .refine(isAllowedCompanyUserImageUrl, 'Image URL must be a valid URL'),
});

export type CreateInternalCompanyUserDto = CompanyUserInput;
export type CreateExternalCompanyUserDto = Omit<CompanyUserInput, 'companyId'>;
export type UpdateInternalCompanyUserDto = Partial<
  Omit<CompanyUserInput, 'companyId' | 'password' | 'imageUrl'>
> & {
  password?: string;
};
export type UpdateExternalCompanyUserDto = Partial<
  Omit<CreateExternalCompanyUserDto, 'password' | 'imageUrl'>
> & {
  password?: string;
};
export type ReplaceCompanyUserImageDto = z.infer<
  typeof replaceCompanyUserImageDtoSchema
>;

/** Example uploaded path for docs / tests. */
export const COMPANY_USER_IMAGE_UPLOAD_EXAMPLE = `${COMPANY_USER_IMAGE_PUBLIC_PREFIX}/550e8400-e29b-41d4-a716-446655440000.png`;
