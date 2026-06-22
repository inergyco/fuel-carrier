import type { CompanyUserInput } from '@fuel-carrier/shared-types';
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

const companyUserBaseSchema = z.object({
  firstName: z.string().min(1).max(COMPANY_USER_FIRST_NAME_MAX_LENGTH),
  lastName: z.string().min(1).max(COMPANY_USER_LAST_NAME_MAX_LENGTH),
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH)
    .max(USERNAME_MAX_LENGTH)
    .regex(USERNAME_PATTERN),
  nationalId: optionalTextField(COMPANY_USER_NATIONAL_ID_MAX_LENGTH).optional(),
  email: optionalTextField(COMPANY_USER_EMAIL_MAX_LENGTH).optional(),
});

export const createCompanyUserDtoSchema = companyUserBaseSchema.extend({
  companyId: z.uuid(),
  password: strongPasswordSchema,
});

export const updateCompanyUserDtoSchema = companyUserBaseSchema
  .extend({
    password: strongPasswordSchema.optional(),
  })
  .partial();

export type CreateCompanyUserDto = CompanyUserInput;
export type UpdateCompanyUserDto = Partial<
  Omit<CompanyUserInput, 'companyId' | 'password'>
> & {
  password?: string;
};
