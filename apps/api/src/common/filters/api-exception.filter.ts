import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  ApiErrorCode,
  type ApiErrorBody,
  type ApiFieldError,
} from '@fuel-carrier/shared-types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import type { ApiExceptionBody } from '../exceptions/api.exception';
import type { ReadinessResult } from '../../health/health.types';
import { formatReadinessFailure } from '../../health/health.utils';
import { httpMessagesToFieldErrors } from '../validation/field-errors.utils';
import { isHealthProbeRequest } from '../health-probe.utils';
import { getRequestId } from '../logging';

const STATUS_TO_CODE = new Map<number, ApiErrorCode>([
  [HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR],
  [HttpStatus.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED],
  [HttpStatus.FORBIDDEN, ApiErrorCode.FORBIDDEN],
  [HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND],
  [HttpStatus.TOO_MANY_REQUESTS, ApiErrorCode.TOO_MANY_REQUESTS],
]);

@Catch()
@Injectable()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(ApiExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const request = host.switchToHttp().getRequest<FastifyRequest>();

    if (isHealthProbeRequest(request.url)) {
      const healthError = this.toHealthProbeError(exception);

      if (healthError) {
        if (healthError.status >= 500) {
          this.logger.error(
            {
              msg: 'health_probe_error',
              requestId: getRequestId(request),
              error: healthError.message,
            },
            healthError.message,
          );
        }

        void response.status(healthError.status).send(healthError.body);
        return;
      }
    }

    const { status, error } = this.toApiError(exception);

    if (status >= 500) {
      const detail =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.error(
        {
          msg: 'http_error',
          requestId: getRequestId(request),
          method: request.method,
          url: request.url,
          statusCode: status,
          err: exception instanceof Error ? exception : undefined,
          error: detail,
        },
        detail,
      );
    }

    void response.status(status).send({ error });
  }

  private toHealthProbeError(exception: unknown): {
    status: number;
    body: ReadinessResult;
    message: string;
  } | null {
    if (!(exception instanceof HttpException)) {
      return null;
    }

    const status = exception.getStatus();
    const body = exception.getResponse();

    if (!isReadinessResult(body)) {
      return null;
    }

    return {
      status,
      body,
      message: formatReadinessFailure(body),
    };
  }

  private toApiError(exception: unknown): {
    status: number;
    error: ApiErrorBody;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (isApiExceptionBody(exceptionResponse)) {
        return { status, error: exceptionResponse };
      }

      if (typeof exceptionResponse === 'string') {
        return {
          status,
          error: {
            code: this._statusToCode(status),
            message: exceptionResponse,
          },
        };
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, unknown>;

        if (typeof body.message === 'string') {
          return {
            status,
            error: {
              code: this._statusToCode(status),
              message: body.message,
            },
          };
        }

        if (Array.isArray(body.message)) {
          const fields = httpMessagesToFieldErrors(body.message);

          if (fields.length > 0) {
            return {
              status,
              error: {
                code: ApiErrorCode.VALIDATION_ERROR,
                message: 'Validation failed',
                fields,
              },
            };
          }

          return {
            status,
            error: {
              code: ApiErrorCode.VALIDATION_ERROR,
              message: body.message.map(String).join('; '),
            },
          };
        }
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
      },
    };
  }

  private _statusToCode(status: number): ApiErrorCode {
    return STATUS_TO_CODE.get(status) ?? ApiErrorCode.INTERNAL_ERROR;
  }
}

function isApiFieldError(value: unknown): value is ApiFieldError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const fieldError = value as Record<string, unknown>;

  return (
    typeof fieldError.field === 'string' &&
    typeof fieldError.message === 'string'
  );
}

function isReadinessResult(value: unknown): value is ReadinessResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    (body.status === 'ok' || body.status === 'error') &&
    typeof body.checks === 'object' &&
    body.checks !== null
  );
}

function isApiExceptionBody(value: unknown): value is ApiExceptionBody {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.code === 'string' &&
    typeof body.message === 'string' &&
    (body.fields === undefined ||
      (Array.isArray(body.fields) && body.fields.every(isApiFieldError)))
  );
}
