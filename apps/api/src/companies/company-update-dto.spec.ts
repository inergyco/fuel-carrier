import { createCompanyDtoSchema } from '@fuel-carrier/shared-validation/company/create';
import {
  replaceCompanyLogoDtoSchema,
  updateCompanyDtoSchema,
} from '@fuel-carrier/shared-validation/company/update';

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
