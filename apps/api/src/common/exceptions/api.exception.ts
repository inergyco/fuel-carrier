import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ApiErrorCode,
  type ApiErrorBody,
  type ApiFieldError,
} from '@fuel-carrier/shared-types';

export type ApiExceptionBody = ApiErrorBody;

export class ApiException extends HttpException {
  constructor(status: HttpStatus, body: ApiExceptionBody) {
    super(body, status);
  }
}

export function createApiException(
  status: HttpStatus,
  code: ApiErrorCode,
  message: string,
  fields?: ApiFieldError[],
): ApiException {
  return new ApiException(status, {
    code,
    message,
    ...(fields ? { fields } : {}),
  });
}
