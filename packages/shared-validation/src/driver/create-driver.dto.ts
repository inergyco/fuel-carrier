import type { DriverInput } from '@fuel-carrier/shared-types';
import { z } from 'zod';

export const DRIVER_FIRST_NAME_MAX_LENGTH = 100;
export const DRIVER_LAST_NAME_MAX_LENGTH = 100;
export const DRIVER_NATIONAL_ID_MAX_LENGTH = 32;

const driverBaseSchema = z.object({
  firstName: z.string().min(1).max(DRIVER_FIRST_NAME_MAX_LENGTH),
  lastName: z.string().min(1).max(DRIVER_LAST_NAME_MAX_LENGTH),
  nationalId: z.string().min(1).max(DRIVER_NATIONAL_ID_MAX_LENGTH),
});

/** Internal admin: companyId is required in the request body. */
export const createInternalDriverDtoSchema = driverBaseSchema.extend({
  companyId: z.uuid(),
});

/** Company user: companyId is taken from the JWT, not the request body. */
export const createExternalDriverDtoSchema = driverBaseSchema;

export const updateInternalDriverDtoSchema =
  createInternalDriverDtoSchema.partial();
export const updateExternalDriverDtoSchema =
  createExternalDriverDtoSchema.partial();

export type CreateInternalDriverDto = DriverInput;
export type CreateExternalDriverDto = Omit<DriverInput, 'companyId'>;
export type UpdateInternalDriverDto = Partial<CreateInternalDriverDto>;
export type UpdateExternalDriverDto = Partial<CreateExternalDriverDto>;
