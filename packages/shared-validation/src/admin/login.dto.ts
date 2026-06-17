import { z } from 'zod';
import { strongPasswordSchema } from '../password';
import { isValidUsername } from '../username';

export const loginDtoSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .refine(isValidUsername, {
      message:
        'Username must be 3–32 characters and contain only letters, numbers, underscores, and hyphens',
    }),
  password: z.string().min(1, 'Password is required').pipe(strongPasswordSchema),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;
