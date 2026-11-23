import { updateCarPricingDtoSchema } from '@fuel-carrier/shared-validation/car/pricing';

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

describe('car pricing DTO schema', () => {
  it('accepts a full pricing set', () => {
    expect(updateCarPricingDtoSchema.parse(validPricing)).toEqual(validPricing);
  });

  it('rejects a partial set and unordered thresholds', () => {
    expect(
      updateCarPricingDtoSchema.safeParse({ petrolPricePerLiter: 1 }).success,
    ).toBe(false);
    expect(
      updateCarPricingDtoSchema.safeParse({
        ...validPricing,
        feeThresholdX: 900,
        feeThresholdY: 100,
        feeThresholdZ: 50,
      }).success,
    ).toBe(false);
  });

  it('accepts clearing every field together', () => {
    expect(
      updateCarPricingDtoSchema.parse({
        petrolPricePerLiter: null,
        feeThresholdX: null,
        feeThresholdY: null,
        feeThresholdZ: null,
        feeUpToX: null,
        feeXToY: null,
        feeYToZ: null,
        feeAboveZ: null,
      }),
    ).toEqual({
      petrolPricePerLiter: null,
      feeThresholdX: null,
      feeThresholdY: null,
      feeThresholdZ: null,
      feeUpToX: null,
      feeXToY: null,
      feeYToZ: null,
      feeAboveZ: null,
    });
  });
});
