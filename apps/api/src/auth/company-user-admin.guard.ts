import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ApiErrorCode, UserRole } from '@fuel-carrier/shared-types';
import { createApiException } from '../common/exceptions/api.exception';
import type { AuthSession } from './auth.types';

@Injectable()
export class CompanyUserAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: AuthSession }>();
    const user = request.user;

    if (user.role !== UserRole.COMPANY_USER) {
      return true;
    }

    if (user.companyUserLevel !== 'admin') {
      throw createApiException(
        HttpStatus.FORBIDDEN,
        ApiErrorCode.FORBIDDEN,
        'Insufficient permissions',
      );
    }

    return true;
  }
}
