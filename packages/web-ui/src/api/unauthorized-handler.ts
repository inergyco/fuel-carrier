type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null
let unauthorizedRedirectScheduled = false

/**
 * Register a once-per-navigation handler for mid-session 401s.
 * Call from each panel's bootstrap (e.g. main.tsx).
 */
export function setApiUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler
  unauthorizedRedirectScheduled = false
}

export function notifyApiUnauthorized(): void {
  if (unauthorizedRedirectScheduled || !unauthorizedHandler) {
    return
  }

  unauthorizedRedirectScheduled = true
  unauthorizedHandler()
}

/** Login 401s are expected (bad credentials) — do not treat as session expiry. */
export function isLoginAuthRequest(request: Request): boolean {
  try {
    return new URL(request.url).pathname.endsWith('/auth/login')
  } catch {
    return false
  }
}
