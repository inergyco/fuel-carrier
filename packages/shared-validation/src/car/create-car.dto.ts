import { z } from "zod";
import { optionalTextField } from "../optional-text-field";
import {
  isValidIranianLicensePlate,
  normalizeIranianLicensePlate,
} from "./license-plate";

export const CAR_LICENSE_PLATE_MAX_LENGTH = 32;
export const CAR_NOTE_MAX_LENGTH = 2000;

export {
  IRANIAN_LICENSE_PLATE_LETTERS,
  IRANIAN_LICENSE_PLATE_PATTERN,
  emptyIranianLicensePlateParts,
  hasIranianLicensePlateParts,
  isCompleteIranianLicensePlateParts,
  isIranianLicensePlateLetter,
  isValidIranianLicensePlate,
  normalizeIranianLicensePlate,
  normalizeIranianLicensePlateLetter,
  parseIranianLicensePlate,
  stringifyIranianLicensePlate,
  toLatinDigits,
  toPersianDigits,
} from "./license-plate";
export type {
  IranianLicensePlateLetter,
  IranianLicensePlateParts,
} from "./license-plate";

export type CarValidationMessages = {
  licensePlateRequired: string;
  licensePlateTooLong: string;
  licensePlateInvalid: string;
  driverRequired: string;
  noteTooLong: string;
};

const defaultCarValidationMessages: CarValidationMessages = {
  licensePlateRequired: "License plate is required",
  licensePlateTooLong: `License plate must be at most ${CAR_LICENSE_PLATE_MAX_LENGTH} characters`,
  licensePlateInvalid: "Enter a valid Iranian license plate",
  driverRequired: "Select a driver",
  noteTooLong: `Note must be at most ${CAR_NOTE_MAX_LENGTH} characters`,
};

function createCarLicensePlateField(messages: CarValidationMessages) {
  return z
    .string()
    .trim()
    .min(1, messages.licensePlateRequired)
    .max(CAR_LICENSE_PLATE_MAX_LENGTH, messages.licensePlateTooLong)
    .transform(normalizeIranianLicensePlate)
    .refine(isValidIranianLicensePlate, {
      message: messages.licensePlateInvalid,
    });
}

/** Live custody driver — uuid only; null unassign is not allowed. */
function createCarDriverIdField(messages: CarValidationMessages) {
  return z.uuid({ error: messages.driverRequired });
}

/** Optimistic concurrency token — null means "expect unassigned". */
const carExpectedDriverIdField = z.uuid().nullable();
const carHasHighGradeField = z.boolean();

function createCarNoteField(messages: CarValidationMessages) {
  return optionalTextField(CAR_NOTE_MAX_LENGTH, messages.noteTooLong);
}

/** Create body: omitted optional fields get create-time defaults. */
export function createCarBaseSchema(
  messages: CarValidationMessages = defaultCarValidationMessages,
) {
  return z.object({
    licensePlate: createCarLicensePlateField(messages),
    driverId: createCarDriverIdField(messages),
    hasHighGrade: carHasHighGradeField.optional().default(false),
    note: createCarNoteField(messages).optional().default(""),
  });
}

export function createCarFormSchemas(
  messages: CarValidationMessages = defaultCarValidationMessages,
) {
  const createSchema = createCarBaseSchema(messages);

  return {
    createSchema,
    editSchema: createSchema.omit({ driverId: true }),
  };
}

const carBaseSchema = createCarBaseSchema();

/**
 * Update body: omitted keys stay undefined (leave unchanged).
 * Do not reuse create defaults via `.partial()` — Zod would still apply them.
 *
 * When `driverId` is present, `expectedDriverId` is required so concurrent
 * custody writes can return 409 instead of last-write-wins false success.
 * `driverId` must be a uuid — unassigning is not allowed.
 */
function createCarUpdateBaseSchema(
  messages: CarValidationMessages = defaultCarValidationMessages,
) {
  return z
    .object({
      licensePlate: createCarLicensePlateField(messages).optional(),
      driverId: createCarDriverIdField(messages).optional(),
      hasHighGrade: carHasHighGradeField.optional(),
      note: createCarNoteField(messages).optional(),
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
}

const carUpdateBaseSchema = createCarUpdateBaseSchema();

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
