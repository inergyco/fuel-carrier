import { strongPasswordSchema } from '@fuel-carrier/shared-validation/password';
import bcrypt from 'bcryptjs';
import { parseZodValue } from '../common/validation/zod.utils';

export const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  parseZodValue(strongPasswordSchema, password);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
