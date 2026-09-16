import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { isApiClientError } from './api-client-error'

type ApplyApiFieldErrorsOptions<TFieldValues extends FieldValues> = {
  error: unknown
  setError: UseFormSetError<TFieldValues>
  fields: readonly Path<TFieldValues>[]
  /** Localized messages for known duplicate/conflict fields. */
  messages?: Partial<Record<Path<TFieldValues>, () => string>>
  fallbackMessage: string
}

/**
 * Maps API `fields[]` onto RHF field errors (preferring localized messages).
 * Returns a banner message, or `null` when field errors were applied.
 */
export function applyApiFieldErrors<TFieldValues extends FieldValues>({
  error,
  setError,
  fields,
  messages,
  fallbackMessage,
}: ApplyApiFieldErrorsOptions<TFieldValues>): string | null {
  if (!isApiClientError(error)) {
    return fallbackMessage
  }

  const allowed = new Set<string>(fields)
  let appliedFieldError = false

  for (const fieldError of error.apiError.fields ?? []) {
    if (!allowed.has(fieldError.field)) {
      continue
    }

    const path = fieldError.field as Path<TFieldValues>
    const localize = messages?.[path]

    setError(path, {
      type: 'server',
      message: localize ? localize() : fieldError.message,
    })
    appliedFieldError = true
  }

  if (appliedFieldError) {
    return null
  }

  return error.apiError.message || fallbackMessage
}
