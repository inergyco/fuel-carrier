import { z } from 'zod';
import {
  createStrongPasswordSchema,
  type PasswordStrengthMessages,
} from '../admin/login.dto';

export type ChangePasswordValidationMessages = {
  currentPasswordRequired: string;
  newPasswordRequired: string;
  confirmPasswordRequired: string;
  passwordsMustMatch: string;
  newPasswordMustDiffer: string;
  passwordStrength: PasswordStrengthMessages;
};

const defaultChangePasswordMessages: ChangePasswordValidationMessages = {
  currentPasswordRequired: 'Current password is required',
  newPasswordRequired: 'New password is required',
  confirmPasswordRequired: 'Please confirm your new password',
  passwordsMustMatch: 'Passwords do not match',
  newPasswordMustDiffer: 'New password must be different from your current password',
  passwordStrength: {
    minLength: 'Password must be at least 12 characters',
    uppercase: 'Password must contain at least one uppercase letter',
    lowercase: 'Password must contain at least one lowercase letter',
    digit: 'Password must contain at least one number',
    special: 'Password must contain at least one special character',
  },
};

export function createChangePasswordDtoSchema(
  messages: ChangePasswordValidationMessages,
) {
  const newPasswordSchema = createStrongPasswordSchema(messages.passwordStrength);

  return z
    .object({
      currentPassword: z.string().min(1, messages.currentPasswordRequired),
      newPassword: z
        .string()
        .min(1, messages.newPasswordRequired)
        .pipe(newPasswordSchema),
      confirmPassword: z.string().min(1, messages.confirmPasswordRequired),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: messages.passwordsMustMatch,
      path: ['confirmPassword'],
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: messages.newPasswordMustDiffer,
      path: ['newPassword'],
    });
}

export const changePasswordDtoSchema = createChangePasswordDtoSchema(
  defaultChangePasswordMessages,
);

export type ChangePasswordDto = z.infer<typeof changePasswordDtoSchema>;
