import type { LoginDto } from "@fuel-carrier/shared-validation/admin/login";
import { api } from "@fuel-carrier/web-ui/api";
import { AUTH_ME_QUERY_KEY } from "@fuel-carrier/web-ui/auth";
import type { AuthSession } from "@fuel-carrier/shared-types";

type AuthPayload = {
  user: AuthSession;
};

export const authKeys = {
  me: AUTH_ME_QUERY_KEY,
};

export async function fetchMe(): Promise<AuthSession> {
  const { user } = await api.get("auth/me").json<AuthPayload>();
  return user;
}

export async function login(credentials: LoginDto): Promise<AuthSession> {
  const { user } = await api
    .post("auth/login", { json: credentials })
    .json<AuthPayload>();
  return user;
}

export async function logout(): Promise<void> {
  await api.post("auth/logout").json();
}
