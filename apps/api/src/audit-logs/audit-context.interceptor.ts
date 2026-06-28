import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { AuthSession } from '@fuel-carrier/shared-types';
import type { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { extractClientIp, extractUserAgent } from './audit-log.utils';
import { AuditRequestContext } from './audit-request.context';

type RequestWithUser = FastifyRequest & {
  user?: AuthSession;
};

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(private readonly auditRequestContext: AuditRequestContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    this.auditRequestContext.setRequestMeta({
      actor: request.user ?? null,
      ipAddress: extractClientIp(request),
      userAgent: extractUserAgent(request),
    });

    return next.handle();
  }
}
