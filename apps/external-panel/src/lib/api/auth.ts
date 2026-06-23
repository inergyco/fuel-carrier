import type { LoginDto } from '@fuel-carrier/shared-validation/admin/login'
import type { ChangePasswordDto } from '@fuel-carrier/shared-validation/auth/change-password'
import type { AuthSession } from '@fuel-carrier/shared-types'
import { api } from '../api'

type AuthPayload = {
  user: AuthSession
}

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export async function fetchMe(): Promise<AuthSession> {
  const { user } = await api.get('auth/me').json<AuthPayload>()
  return user
}

export async function login(credentials: LoginDto): Promise<AuthSession> {
  const { user } = await api
    .post('auth/login', { json: credentials })
    .json<AuthPayload>()
  return user
}

export async function logout(): Promise<void> {
  await api.post('auth/logout').json()
}

export async function changePassword(
  payload: ChangePasswordDto,
): Promise<AuthSession> {
  const { user } = await api
    .post('auth/change-password', { json: payload })
    .json<AuthPayload>()
  return user
}
