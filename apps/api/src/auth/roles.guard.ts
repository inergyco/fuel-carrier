import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ApiErrorCode,
  UserRole,
  type UserRole as UserRoleType,
} from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import type { AuthSession } from './auth.types';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthSession }>();
    const user = request.user;

    if (!requiredRoles.includes(user.role)) {
      throw createApiException(
        HttpStatus.FORBIDDEN,
        ApiErrorCode.FORBIDDEN,
        'Insufficient permissions',
      );
    }

    if (
      user.role === UserRole.COMPANY_USER &&
      requiredRoles.includes(UserRole.COMPANY_USER) &&
      !user.companyId
    ) {
      throw createApiException(
        HttpStatus.FORBIDDEN,
        ApiErrorCode.FORBIDDEN,
        'Company context is missing from the session',
      );
    }

    return true;
  }
}
