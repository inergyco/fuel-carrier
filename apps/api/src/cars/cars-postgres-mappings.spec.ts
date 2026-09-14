import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { ApiException } from '../common/exceptions/api.exception';
import {
  POSTGRES_UNIQUE_VIOLATION,
  rethrowPostgresError,
} from '../database/postgres-error.utils';
import { CAR_POSTGRES_MAPPINGS } from './cars-postgres-mappings';

describe('CAR_POSTGRES_MAPPINGS', () => {
  it('maps cars_driver_id_unique to a clear driverId error', () => {
    try {
      rethrowPostgresError(
        {
          cause: {
            code: POSTGRES_UNIQUE_VIOLATION,
            constraint: 'cars_driver_id_unique',
          },
        },
        CAR_POSTGRES_MAPPINGS,
      );
      throw new Error('expected rethrowPostgresError to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      const exception = error as ApiException;
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getResponse()).toMatchObject({
        code: ApiErrorCode.VALIDATION_ERROR,
        fields: [
          {
            field: 'driverId',
            message: 'This driver is already assigned to another vehicle',
          },
        ],
      });
    }
  });

  it('maps open assignment unique to a clear driverId error', () => {
    try {
      rethrowPostgresError(
        {
          cause: {
            code: POSTGRES_UNIQUE_VIOLATION,
            constraint: 'car_driver_assignments_car_id_open_unique',
          },
        },
        CAR_POSTGRES_MAPPINGS,
      );
      throw new Error('expected rethrowPostgresError to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).getResponse()).toMatchObject({
        code: ApiErrorCode.VALIDATION_ERROR,
        fields: [
          {
            field: 'driverId',
            message: 'This vehicle already has an active driver assignment',
          },
        ],
      });
    }
  });

  it('maps open driver assignment unique to a clear driverId error', () => {
    try {
      rethrowPostgresError(
        {
          cause: {
            code: POSTGRES_UNIQUE_VIOLATION,
            constraint: 'car_driver_assignments_driver_id_open_unique',
          },
        },
        CAR_POSTGRES_MAPPINGS,
      );
      throw new Error('expected rethrowPostgresError to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).getResponse()).toMatchObject({
        code: ApiErrorCode.VALIDATION_ERROR,
        fields: [
          {
            field: 'driverId',
            message: 'This driver already has an active vehicle assignment',
          },
        ],
      });
    }
  });
});
