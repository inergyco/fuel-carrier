import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import { ApiException } from '../common/exceptions/api.exception';
import { LoginBodyGuard } from './login-body.guard';

describe('LoginBodyGuard', () => {
  const guard = new LoginBodyGuard();

  function createContext(body: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ body }),
      }),
    } as ExecutionContext;
  }

  it('allows a valid login body', () => {
    expect(
      guard.canActivate(
        createContext({ username: 'pars_admin', password: 'secret' }),
      ),
    ).toBe(true);
  });

  it('rejects an empty body with validation error', () => {
    try {
      guard.canActivate(createContext({}));
      throw new Error('expected LoginBodyGuard to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      const exception = error as ApiException;
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getResponse()).toMatchObject({
        code: ApiErrorCode.VALIDATION_ERROR,
      });
    }
  });

  it('rejects a body missing password', () => {
    try {
      guard.canActivate(createContext({ username: 'pars_admin' }));
      throw new Error('expected LoginBodyGuard to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });
});
