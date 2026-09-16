import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { ApiException } from '../common/exceptions/api.exception';
import { assertCustodyPrecondition } from './custody-conflict';

describe('assertCustodyPrecondition', () => {
  it('allows matching expectedDriverId', () => {
    expect(() =>
      assertCustodyPrecondition({
        currentDriverId: null,
        expectedDriverId: null,
      }),
    ).not.toThrow();
    expect(() =>
      assertCustodyPrecondition({
        currentDriverId: 'driver-a',
        expectedDriverId: 'driver-a',
      }),
    ).not.toThrow();
  });

  it('allows omission of expectedDriverId (legacy callers)', () => {
    expect(() =>
      assertCustodyPrecondition({ currentDriverId: 'driver-a' }),
    ).not.toThrow();
  });

  it('rejects when car driver changed underfoot', () => {
    try {
      assertCustodyPrecondition({
        currentDriverId: 'driver-b',
        expectedDriverId: null,
      });
      throw new Error('expected conflict');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).getStatus()).toBe(HttpStatus.CONFLICT);
      expect((error as ApiException).getResponse()).toMatchObject({
        code: ApiErrorCode.CONFLICT,
      });
    }
  });
});
