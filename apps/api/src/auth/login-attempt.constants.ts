export const LOGIN_ATTEMPT_USER_LIMIT = 5;
export const LOGIN_ATTEMPT_IP_LIMIT = 20;
export const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;

export type LoginPortal = 'internal' | 'external';

export function loginAttemptKeys(
  portal: LoginPortal,
  ip: string | null,
  username: string | null,
): { ip: string | null; user: string | null } {
  return {
    ip: ip ? `login-attempts:${portal}:ip:${ip}` : null,
    user: username ? `login-attempts:${portal}:user:${username}` : null,
  };
}

export function loginPortalFromPath(path: string): LoginPortal {
  if (path.includes('/external/')) {
    return 'external';
  }

  return 'internal';
}

export function usernameFromLoginBody(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const username = (body as { username?: unknown }).username;
  if (typeof username !== 'string') {
    return null;
  }

  const trimmed = username.trim();
  return trimmed.length > 0 ? trimmed : null;
}
