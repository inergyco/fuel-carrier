import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { ApiSuccessResponse } from '@fuel-carrier/shared-types';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<unknown>> {
    return next.handle().pipe(
      map(function wrapSuccessResponse(
        data: unknown,
      ): ApiSuccessResponse<unknown> {
        return { data: data ?? null };
      }),
    );
  }
}
