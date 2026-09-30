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
/** Live custody driver — uuid only; null unassign is not allowed. */
const carDriverIdField = z.uuid();
/** Optimistic concurrency token — null means "expect unassigned". */
const carExpectedDriverIdField = z.uuid().nullable();
const carNoteField = optionalTextField(CAR_NOTE_MAX_LENGTH);
const carHasHighGradeField = z.boolean();

/** Create body: omitted optional fields get create-time defaults. */
const carBaseSchema = z.object({
  name: carNameField.optional().default(""),
  licensePlate: carLicensePlateField,
  driverId: carDriverIdField,
  hasHighGrade: carHasHighGradeField.optional().default(false),
  note: carNoteField.optional().default(""),
});

/**
 * Update body: omitted keys stay undefined (leave unchanged).
 * Do not reuse create defaults via `.partial()` — Zod would still apply them.
 *
 * When `driverId` is present, `expectedDriverId` is required so concurrent
 * custody writes can return 409 instead of last-write-wins false success.
 * `driverId` must be a uuid — unassigning is not allowed.
 */
const carUpdateBaseSchema = z
  .object({
    name: carNameField.optional(),
    licensePlate: carLicensePlateField.optional(),
    driverId: carDriverIdField.optional(),
    hasHighGrade: carHasHighGradeField.optional(),
    note: carNoteField.optional(),
    expectedDriverId: carExpectedDriverIdField.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.driverId !== undefined && data.expectedDriverId === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "expectedDriverId is required when driverId is set",
        path: ["expectedDriverId"],
      });
    }
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

export type CreateInternalCarDto = z.infer<typeof createInternalCarDtoSchema>;
export type CreateExternalCarDto = z.infer<typeof createExternalCarDtoSchema>;
export type UpdateInternalCarDto = z.infer<typeof updateInternalCarDtoSchema>;
export type UpdateExternalCarDto = z.infer<typeof updateExternalCarDtoSchema>;
