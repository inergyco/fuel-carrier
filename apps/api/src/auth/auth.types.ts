export type { AdminSession } from '@fuel-carrier/shared-types';

export type JwtPayload = {
  sub: string;
  username: string;
  firstName: string;
  lastName: string;
};
