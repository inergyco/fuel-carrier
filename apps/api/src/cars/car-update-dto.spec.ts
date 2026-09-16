import {
  createInternalCarDtoSchema,
  updateInternalCarDtoSchema,
} from '@fuel-carrier/shared-validation/car/create';

const COMPANY_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_COMPANY_ID = '22222222-2222-4222-8222-222222222222';
const DRIVER_ID = '33333333-3333-4333-8333-333333333333';

describe('car update DTO schemas', () => {
  it('applies create defaults when optional fields are omitted', () => {
    const parsed = createInternalCarDtoSchema.parse({
      companyId: COMPANY_ID,
      licensePlate: '12ب345-67',
    });

    expect(parsed).toEqual({
      companyId: COMPANY_ID,
      licensePlate: '12ب345-67',
      name: '',
      driverId: null,
      note: '',
    });
  });

  it('does not invent driverId/name/note on partial companyId PATCH', () => {
    const parsed = updateInternalCarDtoSchema.parse({
      companyId: OTHER_COMPANY_ID,
    });

    expect(parsed).toEqual({
      companyId: OTHER_COMPANY_ID,
    });
    expect('driverId' in parsed).toBe(false);
    expect('name' in parsed).toBe(false);
    expect('note' in parsed).toBe(false);
  });

  it('still allows explicit unassign via driverId null with expectedDriverId', () => {
    const parsed = updateInternalCarDtoSchema.parse({
      driverId: null,
      expectedDriverId: DRIVER_ID,
    });

    expect(parsed).toEqual({
      driverId: null,
      expectedDriverId: DRIVER_ID,
    });
  });

  it('still allows assigning a driver on update with expectedDriverId', () => {
    const parsed = updateInternalCarDtoSchema.parse({
      driverId: DRIVER_ID,
      expectedDriverId: null,
    });

    expect(parsed).toEqual({
      driverId: DRIVER_ID,
      expectedDriverId: null,
    });
  });

  it('rejects driverId without expectedDriverId', () => {
    const result = updateInternalCarDtoSchema.safeParse({
      driverId: DRIVER_ID,
    });

    expect(result.success).toBe(false);
  });
});
