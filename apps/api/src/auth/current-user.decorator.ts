import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthSession } from './auth.types';

export const CurrentUser = createParamDecorator(function currentUser(
  _data: unknown,
  context: ExecutionContext,
): AuthSession {
  const request = context.switchToHttp().getRequest<{ user: AuthSession }>();
  return request.user;
});
