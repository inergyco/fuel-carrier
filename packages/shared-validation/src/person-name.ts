import { z } from 'zod';
import { containsDigit } from './national-id';

export const PERSON_NAME_NO_DIGITS_MESSAGE = 'Name must not contain digits';

export function personNameSchema(options: {
  requiredMessage: string;
  tooLongMessage: string;
  noDigitsMessage: string;
  maxLength: number;
}) {
  return z
    .string()
    .min(1, options.requiredMessage)
    .max(options.maxLength, options.tooLongMessage)
    .refine((value) => !containsDigit(value), options.noDigitsMessage);
}
