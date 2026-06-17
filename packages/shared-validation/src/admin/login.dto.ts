import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from '../password';
import { isValidUsername } from '../username';

export type PasswordStrengthMessages = {
  minLength: string;
  uppercase: string;
  lowercase: string;
  digit: string;
  special: string;
};

export type LoginValidationMessages = {
  usernameRequired: string;
  usernameInvalid: string;
  passwordRequired: string;
  passwordStrength: PasswordStrengthMessages;
};

export function createStrongPasswordSchema(messages: PasswordStrengthMessages) {
  const HAS_UPPERCASE = /[A-Z]/;
  const HAS_LOWERCASE = /[a-z]/;
  const HAS_DIGIT = /\d/;
  const HAS_SPECIAL = /[^A-Za-z0-9]/;

  return z.string().superRefine((password, ctx) => {
    if (password.length < PASSWORD_MIN_LENGTH) {
      ctx.addIssue({ code: 'custom', message: messages.minLength });
    }
    if (!HAS_UPPERCASE.test(password)) {
      ctx.addIssue({ code: 'custom', message: messages.uppercase });
    }
    if (!HAS_LOWERCASE.test(password)) {
      ctx.addIssue({ code: 'custom', message: messages.lowercase });
    }
    if (!HAS_DIGIT.test(password)) {
      ctx.addIssue({ code: 'custom', message: messages.digit });
    }
    if (!HAS_SPECIAL.test(password)) {
      ctx.addIssue({ code: 'custom', message: messages.special });
    }
  });
}

const defaultPasswordStrengthMessages: PasswordStrengthMessages = {
  minLength: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  uppercase: 'Password must contain at least one uppercase letter',
  lowercase: 'Password must contain at least one lowercase letter',
  digit: 'Password must contain at least one number',
  special: 'Password must contain at least one special character',
};

const defaultLoginValidationMessages: LoginValidationMessages = {
  usernameRequired: 'Username is required',
  usernameInvalid:
    'Username must be 3–32 characters and contain only letters, numbers, underscores, and hyphens',
  passwordRequired: 'Password is required',
  passwordStrength: defaultPasswordStrengthMessages,
};

export function createLoginDtoSchema(messages: LoginValidationMessages) {
  return z.object({
    username: z
      .string()
      .min(1, messages.usernameRequired)
      .refine(isValidUsername, {
        message: messages.usernameInvalid,
      }),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .pipe(createStrongPasswordSchema(messages.passwordStrength)),
  });
}

export const loginDtoSchema = createLoginDtoSchema(defaultLoginValidationMessages);

export type LoginDto = z.infer<typeof loginDtoSchema>;
