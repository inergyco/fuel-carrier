import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { loginDtoSchema } from '@fuel-carrier/shared-validation/admin/login';
import type { FastifyRequest } from 'fastify';
import { parseZodDto } from '../common/validation/zod.utils';

/**
 * Runs before passport-local so missing/invalid login bodies return 400
 * instead of passport's 401 for absent username/password fields.
 */
@Injectable()
export class LoginBodyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    parseZodDto(loginDtoSchema, request.body);
    return true;
  }
}
