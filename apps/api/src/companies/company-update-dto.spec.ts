import { createCompanyDtoSchema } from '@fuel-carrier/shared-validation/company/create';
import { updateCompanyPricingDtoSchema } from '@fuel-carrier/shared-validation/company/pricing';
import {
  replaceCompanyLogoDtoSchema,
  updateCompanyDtoSchema,
} from '@fuel-carrier/shared-validation/company/update';

const validPricing = {
  petrolPricePerLiter: 15_000,
  feeThresholdX: 100,
  feeThresholdY: 500,
  feeThresholdZ: 1000,
  feeUpToX: 50_000,
  feeXToY: 100_000,
  feeYToZ: 200_000,
  feeAboveZ: 300_000,
};

describe('company update DTO schema', () => {
  it('requires full body on create', () => {
    const result = createCompanyDtoSchema.safeParse({
      name: 'Acme',
    });

    expect(result.success).toBe(false);
  });

  it('allows single-field PATCH without inventing null optionals', () => {
    const parsed = updateCompanyDtoSchema.parse({
      note: 'Ops note',
    });

    expect(parsed).toEqual({
      note: 'Ops note',
    });
    expect('name' in parsed).toBe(false);
    expect('nationalId' in parsed).toBe(false);
    expect('phoneNumber' in parsed).toBe(false);
    expect('address' in parsed).toBe(false);
    expect('logoUrl' in parsed).toBe(false);
  });

  it('accepts full pricing set and rejects partial or unordered thresholds', () => {
    expect(updateCompanyPricingDtoSchema.parse(validPricing)).toEqual(
      validPricing,
    );
    expect(
      updateCompanyDtoSchema.safeParse({ petrolPricePerLiter: 1 }).success,
    ).toBe(false);
    expect(
      updateCompanyPricingDtoSchema.safeParse({
        ...validPricing,
        feeThresholdX: 900,
        feeThresholdY: 100,
        feeThresholdZ: 50,
      }).success,
    ).toBe(false);
  });

  it('defaults missing create pricing fields to null', () => {
    const parsed = createCompanyDtoSchema.parse({
      name: 'Acme',
      nationalId: '123',
      phoneNumber: '021',
    });

    expect(parsed.petrolPricePerLiter).toBeNull();
    expect(parsed.feeThresholdX).toBeNull();
    expect(parsed.feeAboveZ).toBeNull();
  });

  it('still allows clearing optional text with null/empty', () => {
    expect(updateCompanyDtoSchema.parse({ address: null })).toEqual({
      address: null,
    });
    expect(updateCompanyDtoSchema.parse({ address: '  ' })).toEqual({
      address: null,
    });
  });

  it('rejects logoUrl on generic update; replace schema accepts uploaded paths', () => {
    const logoUrl =
      '/api/uploads/company-logos/550e8400-e29b-41d4-a716-446655440000.png';

    expect(updateCompanyDtoSchema.safeParse({ logoUrl }).success).toBe(false);
    expect(replaceCompanyLogoDtoSchema.parse({ logoUrl })).toEqual({ logoUrl });
    expect(
      replaceCompanyLogoDtoSchema.safeParse({ logoUrl: null }).success,
    ).toBe(false);
    expect(
      replaceCompanyLogoDtoSchema.safeParse({ logoUrl: '/etc/passwd' }).success,
    ).toBe(false);
    expect(
      createCompanyDtoSchema.safeParse({
        name: 'Acme',
        nationalId: '123',
        phoneNumber: '021',
        logoUrl,
      }).success,
    ).toBe(true);
  });

  it('rejects empty required-style fields when they are sent', () => {
    expect(updateCompanyDtoSchema.safeParse({ name: '' }).success).toBe(false);
    expect(updateCompanyDtoSchema.safeParse({ nationalId: '' }).success).toBe(
      false,
    );
  });
});
