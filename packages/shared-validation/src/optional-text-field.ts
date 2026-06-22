import { z } from 'zod';

export function optionalTextField(maxLength: number, tooLongMessage?: string) {
  return z
    .string()
    .max(maxLength, tooLongMessage)
    .transform(function toNullableText(value) {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    });
}
