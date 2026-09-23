const AUTH_ONLY_PATH_PREFIXES = ['/login', '/change-password'] as const

export function sanitizeRedirectPath(redirect: string | undefined): string {
  if (!redirect) {
    return '/'
  }

  if (redirect.startsWith('http://') || redirect.startsWith('https://')) {
    try {
      const url = new URL(redirect)
      if (url.origin !== window.location.origin) {
        return '/'
      }

      return `${url.pathname}${url.search}${url.hash}` || '/'
    } catch {
      return '/'
    }
  }

  if (!redirect.startsWith('/')) {
    return '/'
  }

  if (
    AUTH_ONLY_PATH_PREFIXES.some((prefix) => redirect.startsWith(prefix))
  ) {
    return '/'
  }

  return redirect
}

export function redirectToLoginPage(redirect?: string) {
  if (window.location.pathname.startsWith('/login')) {
    return
  }

  const path = sanitizeRedirectPath(redirect)
  const search = path === '/' ? '' : `?redirect=${encodeURIComponent(path)}`
  window.location.assign(`/login${search}`)
}
