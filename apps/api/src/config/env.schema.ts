import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection string',
    ),
  MIGRATION_DATABASE_URL: z
    .string()
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'MIGRATION_DATABASE_URL must be a PostgreSQL connection string',
    )
    .optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  INTERNAL_AUTH_COOKIE_NAME: z.string().min(1).default('internal_auth_token'),
  EXTERNAL_AUTH_COOKIE_NAME: z.string().min(1).default('external_auth_token'),
  AUTH_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  REDIS_URL: z
    .string()
    .min(1, 'REDIS_URL is required')
    .refine(
      (url) => url.startsWith('redis://') || url.startsWith('rediss://'),
      'REDIS_URL must be a Redis connection string',
    )
    .default('redis://localhost:6379'),
  SWAGGER_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .describe(
      'Expose OpenAPI docs at /api/docs/internal and /api/docs/external',
    ),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid environment variables:\n${message}`);
  }

  return result.data;
}
