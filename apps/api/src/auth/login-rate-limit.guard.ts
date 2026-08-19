import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { LoginAttemptService } from './login-attempt.service';

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  constructor(private readonly loginAttempts: LoginAttemptService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    await this.loginAttempts.assertAllowed(request, reply);
    return true;
  }
}
