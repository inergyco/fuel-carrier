/**
 * Reads a single cookie value from a raw `Cookie` header.
 * Use when Fastify's parsed `request.cookies` is unavailable (e.g. WS handshake).
 */
export function getCookieValue(
  cookieHeader: string | string[] | undefined,
  name: string,
): string | null {
  const header = Array.isArray(cookieHeader)
    ? cookieHeader.join('; ')
    : cookieHeader;

  if (!header) {
    return null;
  }

  for (const part of header.split(';')) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator);
    if (key !== name) {
      continue;
    }

    return decodeURIComponent(trimmed.slice(separator + 1));
  }

  return null;
}
