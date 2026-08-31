import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { ApiSuccessResponse } from '@fuel-carrier/shared-types';
import type { FastifyRequest } from 'fastify';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isHealthProbeRequest } from '../health-probe.utils';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor<
  unknown,
  unknown
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if (isHealthProbeRequest(request.url)) {
      return next.handle();
    }

    return next.handle().pipe(
      map(function wrapSuccessResponse(
        data: unknown,
      ): ApiSuccessResponse<unknown> {
        return { data: data ?? null };
      }),
    );
  }
}
