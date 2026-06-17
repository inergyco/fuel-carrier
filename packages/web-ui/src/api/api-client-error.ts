import type { ApiErrorBody } from '@fuel-carrier/shared-types'

export class ApiClientError extends Error {
  readonly apiError: ApiErrorBody
  readonly status: number

  constructor(apiError: ApiErrorBody, status: number) {
    super(apiError.message)
    this.name = 'ApiClientError'
    this.apiError = apiError
    this.status = status
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}

export type { ApiErrorBody, ApiFieldError, ApiSuccessResponse } from '@fuel-carrier/shared-types'
