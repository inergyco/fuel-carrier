import type { ApiFieldError } from '@fuel-carrier/shared-types';
import type { ZodIssue } from 'zod';

export const UNKNOWN_FIELD = '_';

export function zodIssuesToFieldErrors(issues: ZodIssue[]): ApiFieldError[] {
  return issues.map(function toFieldError(issue) {
    return {
      field: issue.path.length > 0 ? issue.path.join('.') : UNKNOWN_FIELD,
      message: issue.message,
    };
  });
}

export function httpMessagesToFieldErrors(
  messages: unknown[],
): ApiFieldError[] {
  const fields: ApiFieldError[] = [];

  for (const message of messages) {
    const fieldError = parseValidationMessage(message);
    if (fieldError) {
      fields.push(fieldError);
    }
  }

  return fields;
}

function parseValidationMessage(message: unknown): ApiFieldError | null {
  if (typeof message !== 'object' || message === null) {
    return null;
  }

  const item = message as Record<string, unknown>;
  const property = typeof item.property === 'string' ? item.property : null;

  if (!property) {
    return null;
  }

  if (item.constraints && typeof item.constraints === 'object') {
    const constraints = item.constraints as Record<string, string>;
    const firstMessage = Object.values(constraints).find(
      function isNonEmptyMessage(value) {
        return typeof value === 'string' && value.length > 0;
      },
    );

    if (firstMessage) {
      return { field: property, message: firstMessage };
    }
  }

  if (typeof item.message === 'string' && item.message.length > 0) {
    return { field: property, message: item.message };
  }

  return null;
}

export function formatFieldErrors(fields: ApiFieldError[]): string {
  return fields
    .map(function formatFieldError(fieldError) {
      return fieldError.field === UNKNOWN_FIELD
        ? fieldError.message
        : `${fieldError.field}: ${fieldError.message}`;
    })
    .join('; ');
}
