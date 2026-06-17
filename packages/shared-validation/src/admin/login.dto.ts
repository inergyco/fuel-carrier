import { z } from 'zod';
import { strongPasswordSchema } from '../password';
import { isValidUsername } from '../username';

export type LoginDto = {
  username: string;
  password: string;
};

export const loginDtoSchema: z.ZodType<LoginDto> = z.object({
  username: z.string().refine(isValidUsername, {
    message:
      'Username must be 3–32 characters and contain only letters, numbers, underscores, and hyphens',
  }),
  password: strongPasswordSchema,
});
