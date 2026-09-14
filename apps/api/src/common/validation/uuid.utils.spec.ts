import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { ApiException } from '../exceptions/api.exception';
import { assertUuidParam, isUuid } from './uuid.utils';

describe('uuid.utils', () => {
  describe('isUuid', () => {
    it('accepts canonical uuids', () => {
      expect(isUuid('11111111-1111-4111-8111-111111111111')).toBe(true);
    });

    it('rejects malformed ids', () => {
      expect(isUuid('not-a-uuid')).toBe(false);
      expect(isUuid('')).toBe(false);
    });
  });

  describe('assertUuidParam', () => {
    it('throws VALIDATION_ERROR 400 for malformed ids', () => {
      try {
        assertUuidParam('not-a-uuid');
        throw new Error('expected assertUuidParam to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        const exception = error as ApiException;
        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getResponse()).toMatchObject({
          code: ApiErrorCode.VALIDATION_ERROR,
          fields: [{ field: 'id', message: 'Invalid UUID' }],
        });
      }
    });

    it('allows valid uuids', () => {
      expect(() =>
        assertUuidParam('11111111-1111-4111-8111-111111111111'),
      ).not.toThrow();
    });
  });
});
