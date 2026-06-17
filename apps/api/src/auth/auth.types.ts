export type AdminSession = {
  adminId: string;
  username: string;
  firstName: string;
  lastName: string;
};

export type JwtPayload = {
  sub: string;
  username: string;
  firstName: string;
  lastName: string;
};
