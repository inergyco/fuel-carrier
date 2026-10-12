import type { DriverInput } from '@fuel-carrier/shared-types';
import { z } from 'zod';
import { optionalTextField } from '../optional-text-field';
import {
  DRIVER_IMAGE_PUBLIC_PREFIX,
  IMAGE_UPLOAD_URL_MAX_LENGTH,
  isAllowedDriverImageUrl,
} from '../image-upload/constants';
import {
  IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
  IRANIAN_NATIONAL_ID_LENGTH,
  iranianNationalIdSchema,
} from '../national-id';

export const DRIVER_FIRST_NAME_MAX_LENGTH = 100;
export const DRIVER_LAST_NAME_MAX_LENGTH = 100;
export const DRIVER_NATIONAL_ID_MAX_LENGTH = IRANIAN_NATIONAL_ID_LENGTH;
export const DRIVER_MOBILE_NUMBER_MAX_LENGTH = 20;

export type DriverValidationMessages = {
  firstNameRequired: string;
  firstNameTooLong: string;
  lastNameRequired: string;
  lastNameTooLong: string;
  nationalIdInvalid: string;
  mobileNumberRequired: string;
  mobileNumberTooLong: string;
  imageUrlTooLong: string;
  imageUrlInvalid: string;
};

const defaultDriverValidationMessages: DriverValidationMessages = {
  firstNameRequired: 'First name is required',
  firstNameTooLong: `First name must be at most ${DRIVER_FIRST_NAME_MAX_LENGTH} characters`,
  lastNameRequired: 'Last name is required',
  lastNameTooLong: `Last name must be at most ${DRIVER_LAST_NAME_MAX_LENGTH} characters`,
  nationalIdInvalid: IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
  mobileNumberRequired: 'Mobile number is required',
  mobileNumberTooLong: `Mobile number must be at most ${DRIVER_MOBILE_NUMBER_MAX_LENGTH} characters`,
  imageUrlTooLong: `Image URL must be at most ${IMAGE_UPLOAD_URL_MAX_LENGTH} characters`,
  imageUrlInvalid: 'Image URL must be a valid URL',
};

export function createDriverBaseSchema(
  messages: DriverValidationMessages = defaultDriverValidationMessages,
) {
  return z.object({
    firstName: z
      .string()
      .min(1, messages.firstNameRequired)
      .max(DRIVER_FIRST_NAME_MAX_LENGTH, messages.firstNameTooLong),
    lastName: z
      .string()
      .min(1, messages.lastNameRequired)
      .max(DRIVER_LAST_NAME_MAX_LENGTH, messages.lastNameTooLong),
    nationalId: iranianNationalIdSchema(messages.nationalIdInvalid),
    mobileNumber: z
      .string()
      .min(1, messages.mobileNumberRequired)
      .max(DRIVER_MOBILE_NUMBER_MAX_LENGTH, messages.mobileNumberTooLong),
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
