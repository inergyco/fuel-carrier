import { createCompanyDtoSchema } from '@fuel-carrier/shared-validation/company/create';
import { updateCompanyDtoSchema } from '@fuel-carrier/shared-validation/company/update';

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

  it('still allows clearing optional text with null/empty', () => {
    expect(updateCompanyDtoSchema.parse({ address: null })).toEqual({
      address: null,
    });
    expect(updateCompanyDtoSchema.parse({ address: '  ' })).toEqual({
      address: null,
    });
  });

  it('rejects empty required-style fields when they are sent', () => {
    expect(updateCompanyDtoSchema.safeParse({ name: '' }).success).toBe(false);
    expect(updateCompanyDtoSchema.safeParse({ nationalId: '' }).success).toBe(
      false,
    );
  });
});
