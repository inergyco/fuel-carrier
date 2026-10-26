const AUTH_ONLY_PATH_PREFIXES = ['/login', '/change-password'] as const

export function sanitizeRedirectPath(
  redirect: string | undefined,
  fallback = '/',
): string {
  if (!redirect) {
    return fallback
  }

  if (redirect.startsWith('http://') || redirect.startsWith('https://')) {
    try {
      const url = new URL(redirect)
      if (url.origin !== window.location.origin) {
        return fallback
      }

      return `${url.pathname}${url.search}${url.hash}` || fallback
    } catch {
      return fallback
    }
  }

  if (!redirect.startsWith('/')) {
    return fallback
  }

  if (
    AUTH_ONLY_PATH_PREFIXES.some((prefix) => redirect.startsWith(prefix))
  ) {
    return fallback
  }

  return redirect
}

export function redirectToLoginPage(redirect?: string) {
  if (window.location.pathname.startsWith('/login')) {
    return
  }

  const path = sanitizeRedirectPath(redirect)
  const search =
    path === '/' || path === '/panel' ? '' : `?redirect=${encodeURIComponent(path)}`
  window.location.assign(`/login${search}`)
}
