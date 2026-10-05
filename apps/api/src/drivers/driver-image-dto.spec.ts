import {
  createExternalDriverDtoSchema,
  replaceDriverImageDtoSchema,
  updateExternalDriverDtoSchema,
} from '@fuel-carrier/shared-validation/driver/create';

describe('driver image DTO schema', () => {
  it('accepts create with optional imageUrl', () => {
    const imageUrl =
      '/api/uploads/driver-images/550e8400-e29b-41d4-a716-446655440000.png';

    expect(
      createExternalDriverDtoSchema.parse({
        firstName: 'Ada',
        lastName: 'Lovelace',
        nationalId: '123',
        mobileNumber: '09120000000',
        imageUrl,
      }),
    ).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      nationalId: '123',
      mobileNumber: '09120000000',
      imageUrl,
    });

    expect(
      createExternalDriverDtoSchema.parse({
        firstName: 'Ada',
        lastName: 'Lovelace',
        nationalId: '123',
        mobileNumber: '09120000000',
        imageUrl: '',
      }).imageUrl,
    ).toBeNull();
  });

  it('rejects imageUrl on generic update; replace schema accepts uploaded paths', () => {
    const imageUrl =
      '/api/uploads/driver-images/550e8400-e29b-41d4-a716-446655440000.png';

    expect(
      updateExternalDriverDtoSchema.safeParse({ imageUrl }).success,
    ).toBe(false);
    expect(replaceDriverImageDtoSchema.parse({ imageUrl })).toEqual({
      imageUrl,
    });
    expect(
      replaceDriverImageDtoSchema.safeParse({ imageUrl: null }).success,
    ).toBe(false);
    expect(
      replaceDriverImageDtoSchema.safeParse({ imageUrl: '/etc/passwd' })
        .success,
    ).toBe(false);
  });
});
