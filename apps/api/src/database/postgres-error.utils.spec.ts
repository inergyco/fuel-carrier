import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { ApiException } from '../common/exceptions/api.exception';
import {
  POSTGRES_UNIQUE_VIOLATION,
  getPostgresError,
  rethrowPostgresError,
} from './postgres-error.utils';

describe('postgres-error.utils', () => {
  describe('getPostgresError', () => {
    it('reads code and constraint from a bare pg error', () => {
      expect(
        getPostgresError({
          code: POSTGRES_UNIQUE_VIOLATION,
          constraint: 'cars_license_plate_unique',
        }),
      ).toEqual({
        code: POSTGRES_UNIQUE_VIOLATION,
        constraint: 'cars_license_plate_unique',
      });
    });

    it('unwraps nested Drizzle/node-pg cause chains', () => {
      const nested = {
        message: 'DrizzleQueryError',
        cause: {
          code: POSTGRES_UNIQUE_VIOLATION,
          constraint: 'drivers_national_id_unique',
        },
      };

      expect(getPostgresError(nested)).toEqual({
        code: POSTGRES_UNIQUE_VIOLATION,
        constraint: 'drivers_national_id_unique',
      });
    });

    it('unwraps deeper cause nesting', () => {
      expect(
        getPostgresError({
          cause: {
            cause: {
              code: POSTGRES_UNIQUE_VIOLATION,
              constraint: 'cars_license_plate_unique',
            },
          },
        }),
      ).toEqual({
        code: POSTGRES_UNIQUE_VIOLATION,
        constraint: 'cars_license_plate_unique',
      });
    });

    it('returns null for non-objects', () => {
      expect(getPostgresError(null)).toBeNull();
      expect(getPostgresError('boom')).toBeNull();
    });
  });

  describe('rethrowPostgresError', () => {
    const mappings = [
      {
        code: POSTGRES_UNIQUE_VIOLATION,
        constraint: 'cars_license_plate_unique',
        field: 'licensePlate',
        message: 'A car with this license plate already exists',
      },
    ] as const;

    it('maps nested unique violations to VALIDATION_ERROR 400', () => {
      const wrapped = {
        message: 'Failed query',
        cause: {
          code: POSTGRES_UNIQUE_VIOLATION,
          constraint: 'cars_license_plate_unique',
        },
      };

      try {
        rethrowPostgresError(wrapped, [...mappings]);
        throw new Error('expected rethrowPostgresError to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        const exception = error as ApiException;
        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getResponse()).toMatchObject({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          fields: [
            {
              field: 'licensePlate',
              message: 'A car with this license plate already exists',
            },
          ],
        });
      }
    });

    it('rethrows unknown errors unchanged', () => {
      const original = new Error('unrelated');
      expect(() => rethrowPostgresError(original, [...mappings])).toThrow(
        original,
      );
    });
  });
});
