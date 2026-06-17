import type { ApiErrorCode } from './api-error-code';

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorBody = {
  code: ApiErrorCode;
  message: string;
  fields?: ApiFieldError[];
};

export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: ApiErrorBody;
};

export function isApiSuccessResponse<T>(
  value: unknown,
): value is ApiSuccessResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    !('error' in value)
  );
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorResponse).error === 'object' &&
    (value as ApiErrorResponse).error !== null
  );
}
