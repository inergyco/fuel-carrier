import type { CompanyUserInput } from '@fuel-carrier/shared-types';
import { COMPANY_USER_LEVELS } from '@fuel-carrier/shared-types';
import { z } from 'zod';
import { optionalTextField } from '../optional-text-field';
import { strongPasswordSchema } from '../password';
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from '../username';

export const COMPANY_USER_FIRST_NAME_MAX_LENGTH = 100;
export const COMPANY_USER_LAST_NAME_MAX_LENGTH = 100;
export const COMPANY_USER_NATIONAL_ID_MAX_LENGTH = 32;
export const COMPANY_USER_EMAIL_MAX_LENGTH = 254;

const companyUserLevelSchema = z.enum(COMPANY_USER_LEVELS);

const companyUserBaseSchema = z.object({
  firstName: z.string().min(1).max(COMPANY_USER_FIRST_NAME_MAX_LENGTH),
  lastName: z.string().min(1).max(COMPANY_USER_LAST_NAME_MAX_LENGTH),
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH)
    .max(USERNAME_MAX_LENGTH)
    .regex(USERNAME_PATTERN),
  level: companyUserLevelSchema,
  nationalId: optionalTextField(COMPANY_USER_NATIONAL_ID_MAX_LENGTH).optional(),
  email: optionalTextField(COMPANY_USER_EMAIL_MAX_LENGTH).optional(),
});

/** Internal admin: companyId is required in the request body. */
export const createInternalCompanyUserDtoSchema = companyUserBaseSchema.extend({
  companyId: z.uuid(),
  password: strongPasswordSchema,
});

/** Company user: companyId is taken from the JWT, not the request body. */
export const createExternalCompanyUserDtoSchema = companyUserBaseSchema.extend({
  password: strongPasswordSchema,
});

/** @deprecated Use createInternalCompanyUserDtoSchema */
export const createCompanyUserDtoSchema = createInternalCompanyUserDtoSchema;

export const updateInternalCompanyUserDtoSchema =
  createInternalCompanyUserDtoSchema.partial();
export const updateExternalCompanyUserDtoSchema =
  createExternalCompanyUserDtoSchema.partial();

/** @deprecated Use updateInternalCompanyUserDtoSchema */
export const updateCompanyUserDtoSchema = updateInternalCompanyUserDtoSchema;

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
