import type { LoginDto } from "@fuel-carrier/shared-validation/admin/login";
import { api } from "./api";
import type { AuthSession } from "@fuel-carrier/shared-types";

type AuthPayload = {
  user: AuthSession;
};

export const authKeys = {
  me: ["auth", "me"] as const,
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
