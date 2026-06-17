import type { AdminSession } from "@fuel-carrier/shared-types";
import type { LoginDto } from "@fuel-carrier/shared-validation/admin/login";
import { api } from "./api";

export type { AdminSession };

type AuthResponse = {
  user: AdminSession;
};

export const authKeys = {
  me: ["auth", "me"] as const,
};

export async function fetchMe(): Promise<AdminSession> {
  const { user } = await api.get("auth/me").json<AuthResponse>();
  return user;
}

export async function login(credentials: LoginDto): Promise<AdminSession> {
  const { user } = await api
    .post("auth/login", { json: credentials })
    .json<AuthResponse>();
  return user;
}

export async function logout(): Promise<void> {
  await api.post("auth/logout");
}
