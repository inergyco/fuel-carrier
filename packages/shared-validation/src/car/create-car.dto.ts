import type { CarInput } from "@fuel-carrier/shared-types";
import { z } from "zod";
import { optionalTextField } from "../optional-text-field";

export const CAR_NAME_MAX_LENGTH = 200;
export const CAR_LICENSE_PLATE_MAX_LENGTH = 32;
export const CAR_NOTE_MAX_LENGTH = 2000;

const carBaseSchema = z.object({
  name: optionalTextField(CAR_NAME_MAX_LENGTH).optional().default(""),
  licensePlate: z.string().min(1).max(CAR_LICENSE_PLATE_MAX_LENGTH),
  driverId: z.uuid().nullable().optional().default(null),
  note: optionalTextField(CAR_NOTE_MAX_LENGTH).optional().default(""),
});

/** Internal admin: companyId is required in the request body. */
export const createInternalCarDtoSchema = carBaseSchema.extend({
  companyId: z.uuid(),
});

/** Company user: companyId is taken from the JWT, not the request body. */
export const createExternalCarDtoSchema = carBaseSchema;

export const updateInternalCarDtoSchema = createInternalCarDtoSchema.partial();
export const updateExternalCarDtoSchema = createExternalCarDtoSchema.partial();

export type CreateInternalCarDto = CarInput;
export type CreateExternalCarDto = Omit<CarInput, "companyId">;
export type UpdateInternalCarDto = Partial<CreateInternalCarDto>;
export type UpdateExternalCarDto = Partial<CreateExternalCarDto>;
