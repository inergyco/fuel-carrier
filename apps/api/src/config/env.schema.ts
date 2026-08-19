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
  MQTT_URL: z
    .string()
    .min(1)
    .refine(
      (url) => url.startsWith('mqtt://') || url.startsWith('mqtts://'),
      'MQTT_URL must start with mqtt:// or mqtts://',
    )
    .optional(),
  MQTT_USERNAME: z.string().min(1).optional(),
  MQTT_PASSWORD: z.string().min(1).optional(),
  MQTT_TELEMETRY_TOPIC: z.string().min(1).default('telemetry/#'),
  SWAGGER_ENABLED: z
    .enum(['true', 'false'])
    .default(function swaggerDefault() {
      return process.env.NODE_ENV === 'production' ? 'false' : 'true';
    })
    .describe(
      'Expose OpenAPI docs at /api/docs/internal and /api/docs/external. Ignored in production (always off).',
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

  if (
    result.data.MQTT_URL &&
    (!result.data.MQTT_USERNAME || !result.data.MQTT_PASSWORD)
  ) {
    throw new Error(
      'Invalid environment variables:\nMQTT_USERNAME and MQTT_PASSWORD are required when MQTT_URL is set',
    );
  }

  return result.data;
}
