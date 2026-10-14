import type { DriverInput } from '@fuel-carrier/shared-types';
import { z } from 'zod';
import { optionalTextField } from '../optional-text-field';
import {
  DRIVER_IMAGE_PUBLIC_PREFIX,
  IMAGE_UPLOAD_URL_MAX_LENGTH,
  isAllowedDriverImageUrl,
} from '../image-upload/constants';
import {
  IRANIAN_MOBILE_NUMBER_INVALID_MESSAGE,
  IRANIAN_MOBILE_NUMBER_LENGTH,
  iranianMobileNumberSchema,
} from '../mobile-number';
import {
  IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
  IRANIAN_NATIONAL_ID_LENGTH,
  iranianNationalIdSchema,
} from '../national-id';
import {
  PERSON_NAME_NO_DIGITS_MESSAGE,
  personNameSchema,
} from '../person-name';

export const DRIVER_FIRST_NAME_MAX_LENGTH = 100;
export const DRIVER_LAST_NAME_MAX_LENGTH = 100;
export const DRIVER_NATIONAL_ID_MAX_LENGTH = IRANIAN_NATIONAL_ID_LENGTH;
export const DRIVER_MOBILE_NUMBER_MAX_LENGTH = IRANIAN_MOBILE_NUMBER_LENGTH;

export type DriverValidationMessages = {
  firstNameRequired: string;
  firstNameTooLong: string;
  firstNameNoDigits: string;
  lastNameRequired: string;
  lastNameTooLong: string;
  lastNameNoDigits: string;
  nationalIdInvalid: string;
  mobileNumberRequired: string;
  mobileNumberInvalid: string;
  imageUrlTooLong: string;
  imageUrlInvalid: string;
};

const defaultDriverValidationMessages: DriverValidationMessages = {
  firstNameRequired: 'First name is required',
  firstNameTooLong: `First name must be at most ${DRIVER_FIRST_NAME_MAX_LENGTH} characters`,
  firstNameNoDigits: PERSON_NAME_NO_DIGITS_MESSAGE,
  lastNameRequired: 'Last name is required',
  lastNameTooLong: `Last name must be at most ${DRIVER_LAST_NAME_MAX_LENGTH} characters`,
  lastNameNoDigits: PERSON_NAME_NO_DIGITS_MESSAGE,
  nationalIdInvalid: IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
  mobileNumberRequired: 'Mobile number is required',
  mobileNumberInvalid: IRANIAN_MOBILE_NUMBER_INVALID_MESSAGE,
  imageUrlTooLong: `Image URL must be at most ${IMAGE_UPLOAD_URL_MAX_LENGTH} characters`,
  imageUrlInvalid: 'Image URL must be a valid URL',
};

export function createDriverBaseSchema(
  messages: DriverValidationMessages = defaultDriverValidationMessages,
) {
  return z.object({
    firstName: personNameSchema({
      requiredMessage: messages.firstNameRequired,
      tooLongMessage: messages.firstNameTooLong,
      noDigitsMessage: messages.firstNameNoDigits,
      maxLength: DRIVER_FIRST_NAME_MAX_LENGTH,
    }),
    lastName: personNameSchema({
      requiredMessage: messages.lastNameRequired,
      tooLongMessage: messages.lastNameTooLong,
      noDigitsMessage: messages.lastNameNoDigits,
      maxLength: DRIVER_LAST_NAME_MAX_LENGTH,
    }),
    nationalId: iranianNationalIdSchema(messages.nationalIdInvalid),
    mobileNumber: iranianMobileNumberSchema(
      messages.mobileNumberInvalid,
      messages.mobileNumberRequired,
    ),
    imageUrl: optionalTextField(
      IMAGE_UPLOAD_URL_MAX_LENGTH,
      messages.imageUrlTooLong,
    ).pipe(
      z.union([
        z.null(),
        z.string().refine(isAllowedDriverImageUrl, messages.imageUrlInvalid),
      ]),
    ),
  });
}

const driverBaseSchema = createDriverBaseSchema();

/** Internal admin: companyId is required in the request body. */
export const createInternalDriverDtoSchema = driverBaseSchema.extend({
  companyId: z.uuid(),
});

/** Company user: companyId is taken from the JWT, not the request body. */
export const createExternalDriverDtoSchema = driverBaseSchema;

/**
 * Image changes go through `replaceDriverImageDtoSchema` / replaceImage only —
 * generic PATCH must not touch the filesystem.
 */
export const updateInternalDriverDtoSchema = createInternalDriverDtoSchema
  .omit({ imageUrl: true })
  .partial()
  .strict();

export const updateExternalDriverDtoSchema = createExternalDriverDtoSchema
  .omit({ imageUrl: true })
  .partial()
  .strict();

/** Explicit image replace — clear via DELETE …/image. */
export const replaceDriverImageDtoSchema = z.object({
  imageUrl: z
    .string()
    .max(
      IMAGE_UPLOAD_URL_MAX_LENGTH,
      `Image URL must be at most ${IMAGE_UPLOAD_URL_MAX_LENGTH} characters`,
    )
    .refine(isAllowedDriverImageUrl, 'Image URL must be a valid URL'),
});

export type CreateInternalDriverDto = DriverInput;
export type CreateExternalDriverDto = Omit<DriverInput, 'companyId'>;
export type UpdateInternalDriverDto = Partial<
  Omit<CreateInternalDriverDto, 'imageUrl'>
>;
export type UpdateExternalDriverDto = Partial<
  Omit<CreateExternalDriverDto, 'imageUrl'>
>;
export type ReplaceDriverImageDto = z.infer<typeof replaceDriverImageDtoSchema>;

/** Example uploaded path for docs / tests. */
export const DRIVER_IMAGE_UPLOAD_EXAMPLE = `${DRIVER_IMAGE_PUBLIC_PREFIX}/550e8400-e29b-41d4-a716-446655440000.png`;
