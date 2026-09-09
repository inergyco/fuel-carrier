import type { CarInput } from "@fuel-carrier/shared-types";
import { z } from "zod";
import { optionalTextField } from "../optional-text-field";

export const CAR_NAME_MAX_LENGTH = 200;
export const CAR_LICENSE_PLATE_MAX_LENGTH = 32;
export const CAR_NOTE_MAX_LENGTH = 2000;

const carNameField = optionalTextField(CAR_NAME_MAX_LENGTH);
const carLicensePlateField = z
  .string()
  .min(1)
  .max(CAR_LICENSE_PLATE_MAX_LENGTH);
const carDriverIdField = z.uuid().nullable();
const carNoteField = optionalTextField(CAR_NOTE_MAX_LENGTH);

/** Create body: omitted optional fields get create-time defaults. */
const carBaseSchema = z.object({
  name: carNameField.optional().default(""),
  licensePlate: carLicensePlateField,
  driverId: carDriverIdField.optional().default(null),
  note: carNoteField.optional().default(""),
});

/**
 * Update body: omitted keys stay undefined (leave unchanged).
 * Do not reuse create defaults via `.partial()` — Zod would still apply them.
 */
const carUpdateBaseSchema = z.object({
  name: carNameField.optional(),
  licensePlate: carLicensePlateField.optional(),
  driverId: carDriverIdField.optional(),
  note: carNoteField.optional(),
});

/** Internal admin: companyId is required in the request body. */
export const createInternalCarDtoSchema = carBaseSchema.extend({
  companyId: z.uuid(),
});

/** Company user: companyId is taken from the JWT, not the request body. */
export const createExternalCarDtoSchema = carBaseSchema;

export const updateInternalCarDtoSchema = carUpdateBaseSchema.extend({
  companyId: z.uuid().optional(),
});
export const updateExternalCarDtoSchema = carUpdateBaseSchema;

export type CreateInternalCarDto = CarInput;
export type CreateExternalCarDto = Omit<CarInput, "companyId">;
export type UpdateInternalCarDto = Partial<CreateInternalCarDto>;
export type UpdateExternalCarDto = Partial<CreateExternalCarDto>;
