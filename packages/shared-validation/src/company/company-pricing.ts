import type { CompanyPricingInput } from '@fuel-carrier/shared-types';
import { z, type RefinementCtx } from 'zod';

export const COMPANY_PRICING_KEYS = [
  'petrolPricePerLiter',
  'feeThresholdX',
  'feeThresholdY',
  'feeThresholdZ',
  'feeUpToX',
  'feeXToY',
  'feeYToZ',
  'feeAboveZ',
] as const satisfies readonly (keyof CompanyPricingInput)[];

export type CompanyPricingValidationMessages = {
  numberInvalid: string;
  numberNegative: string;
  pricingIncomplete: string;
  feeThresholdOrder: string;
};

function toNullableNumber(value: unknown): unknown {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value;
}

function nullableNonNegativeNumber(messages: CompanyPricingValidationMessages) {
  return z.preprocess(
    toNullableNumber,
    z.union([
      z.null(),
      z
        .number({ error: messages.numberInvalid })
        .nonnegative({ error: messages.numberNegative }),
    ]),
  );
}

/** API PATCH: omit stays undefined; null clears when sent with the full set. */
function optionalNullableNonNegativeNumber(
  messages: CompanyPricingValidationMessages,
) {
  return z
    .union([
      z.null(),
      z
        .number({ error: messages.numberInvalid })
        .nonnegative({ error: messages.numberNegative }),
    ])
    .optional();
}

export function companyPricingObjectSchema(
  messages: CompanyPricingValidationMessages,
) {
  const field = nullableNonNegativeNumber(messages);

  return z.object({
    petrolPricePerLiter: field,
    feeThresholdX: field,
    feeThresholdY: field,
    feeThresholdZ: field,
    feeUpToX: field,
    feeXToY: field,
    feeYToZ: field,
    feeAboveZ: field,
  });
}

export function optionalCompanyPricingObjectSchema(
  messages: CompanyPricingValidationMessages,
) {
  const field = optionalNullableNonNegativeNumber(messages);

  return z.object({
    petrolPricePerLiter: field,
    feeThresholdX: field,
    feeThresholdY: field,
    feeThresholdZ: field,
    feeUpToX: field,
    feeXToY: field,
    feeYToZ: field,
    feeAboveZ: field,
  });
}

export function refineCompanyPricing(
  data: Partial<CompanyPricingInput>,
  ctx: RefinementCtx,
  messages: CompanyPricingValidationMessages,
): void {
  const definedKeys = COMPANY_PRICING_KEYS.filter(
    (key) => data[key] !== undefined,
  );

  if (definedKeys.length === 0) {
    return;
  }

  if (definedKeys.length < COMPANY_PRICING_KEYS.length) {
    for (const key of COMPANY_PRICING_KEYS) {
      if (data[key] === undefined) {
        ctx.addIssue({
          code: 'custom',
          message: messages.pricingIncomplete,
          path: [key],
        });
      }
    }
    return;
  }

  const values = COMPANY_PRICING_KEYS.map((key) => data[key] as number | null);
  const anyNonNull = values.some((value) => value !== null);
  const anyNull = values.some((value) => value === null);

  if (anyNonNull && anyNull) {
    for (const key of COMPANY_PRICING_KEYS) {
      if (data[key] === null) {
        ctx.addIssue({
          code: 'custom',
          message: messages.pricingIncomplete,
          path: [key],
        });
      }
    }
    return;
  }

  if (!anyNonNull) {
    return;
  }

  const x = data.feeThresholdX as number;
  const y = data.feeThresholdY as number;
  const z = data.feeThresholdZ as number;

  if (!(x > 0 && x < y && y < z)) {
    for (const key of [
      'feeThresholdX',
      'feeThresholdY',
      'feeThresholdZ',
    ] as const) {
      ctx.addIssue({
        code: 'custom',
        message: messages.feeThresholdOrder,
        path: [key],
      });
    }
  }
}

export function createUpdateCompanyPricingDtoSchema(
  messages: CompanyPricingValidationMessages,
): z.ZodType<CompanyPricingInput> {
  return companyPricingObjectSchema(messages).superRefine((data, ctx) => {
    refineCompanyPricing(data, ctx, messages);
  });
}

const defaultPricingMessages: CompanyPricingValidationMessages = {
  numberInvalid: 'Must be a valid number',
  numberNegative: 'Must be zero or greater',
  pricingIncomplete:
    'Petrol price and all fee range fields must be set together',
  feeThresholdOrder: 'Fee thresholds must satisfy 0 < x < y < z',
};

export const updateCompanyPricingDtoSchema: z.ZodType<CompanyPricingInput> =
  createUpdateCompanyPricingDtoSchema(defaultPricingMessages);

export type UpdateCompanyPricingDto = CompanyPricingInput;
