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

  return redirect
}
