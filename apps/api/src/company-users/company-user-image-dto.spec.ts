import {
  createExternalCompanyUserDtoSchema,
  replaceCompanyUserImageDtoSchema,
  updateExternalCompanyUserDtoSchema,
} from '@fuel-carrier/shared-validation/company-user/create';

const validUser = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  username: 'ada_lovelace',
  password: 'SecretPass1!',
  level: 'admin' as const,
};

describe('company user image DTO schema', () => {
  it('accepts create with optional imageUrl', () => {
    const imageUrl =
      '/api/uploads/company-user-images/550e8400-e29b-41d4-a716-446655440000.png';

    expect(
      createExternalCompanyUserDtoSchema.parse({
        ...validUser,
        imageUrl,
      }),
    ).toMatchObject({
      username: 'ada_lovelace',
      imageUrl,
    });

    expect(
      createExternalCompanyUserDtoSchema.parse({
        ...validUser,
        imageUrl: '',
      }).imageUrl,
    ).toBeNull();
  });

  it('rejects imageUrl on generic update; replace schema accepts uploaded paths', () => {
    const imageUrl =
      '/api/uploads/company-user-images/550e8400-e29b-41d4-a716-446655440000.png';

    expect(
      updateExternalCompanyUserDtoSchema.safeParse({ imageUrl }).success,
    ).toBe(false);
    expect(replaceCompanyUserImageDtoSchema.parse({ imageUrl })).toEqual({
      imageUrl,
    });
    expect(
      replaceCompanyUserImageDtoSchema.safeParse({ imageUrl: null }).success,
    ).toBe(false);
    expect(
      replaceCompanyUserImageDtoSchema.safeParse({ imageUrl: '/etc/passwd' })
        .success,
    ).toBe(false);
  });
});
