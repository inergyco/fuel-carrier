import { z } from 'zod';

export const EMAIL_INVALID_MESSAGE = 'Enter a valid email address';

/**
 * Optional email: empty/null → null;
 * otherwise must be a valid email within maxLength.
 */
export function optionalEmailSchema(
  maxLength: number,
  messages: {
    tooLong: string;
    invalid: string;
  },
) {
  return z.preprocess(
    function normalizeOptionalEmail(value) {
      return value == null ? '' : value;
    },
    z
      .string()
      .max(maxLength, messages.tooLong)
      .transform(function toNullableEmail(value) {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      })
      .pipe(
        z.union([z.null(), z.email(messages.invalid)]),
      ),
  );
}
