import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiErrorCode,
  type ApiErrorBody,
  type ApiFieldError,
} from '@fuel-carrier/shared-types';
import type { FastifyReply } from 'fastify';
import type { ApiExceptionBody } from '../exceptions/api.exception';
import { httpMessagesToFieldErrors } from '../validation/field-errors.utils';

const STATUS_TO_CODE = new Map<number, ApiErrorCode>([
  [HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_ERROR],
  [HttpStatus.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED],
  [HttpStatus.FORBIDDEN, ApiErrorCode.FORBIDDEN],
  [HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND],
]);

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const { status, error } = this.toApiError(exception);

    void response.status(status).send({ error });
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
            code: this.statusToCode(status),
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
              code: this.statusToCode(status),
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

  private statusToCode(status: number): ApiErrorCode {
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
