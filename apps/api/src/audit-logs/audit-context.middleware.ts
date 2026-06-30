import { Injectable, NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { extractClientIp, extractUserAgent } from './audit-log.utils';
import { runInAuditRequestScope } from './audit-request.context';

@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
  use(
    request: FastifyRequest,
    _response: FastifyReply,
    next: () => void,
  ): void {
    runInAuditRequestScope(
      {
        ipAddress: extractClientIp(request),
        userAgent: extractUserAgent(request),
      },
      next,
    );
  }
}
