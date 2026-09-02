import { z } from 'zod';

export const DEV_CORS_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
] as const;

export function parseCorsAllowedOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(',')
    .map(function trimOrigin(origin) {
      return origin.trim();
    })
    .filter(function keepNonEmpty(origin) {
      return origin.length > 0;
    });
}

export function corsAllowedOriginsSchema() {
  return z
    .string()
    .optional()
    .transform(function resolveCorsAllowedOrigins(raw, ctx): string[] {
      const parsed = parseCorsAllowedOrigins(raw);
      if (parsed.length > 0) {
        return parsed;
      }

      if (process.env.NODE_ENV === 'production') {
        ctx.addIssue({
          code: 'custom',
          message:
            'CORS_ALLOWED_ORIGINS is required in production (comma-separated panel URLs, e.g. https://admin.example.com,https://app.example.com)',
        });
        return z.NEVER;
      }

      return [...DEV_CORS_ALLOWED_ORIGINS];
    });
}

export function createSocketCorsOptions(allowedOrigins: string[]) {
  return {
    origin: allowedOrigins,
    credentials: true,
  };
}
