/**
 * OpenAPI UI is local/dev only. Production never serves /api/docs,
 * even if SWAGGER_ENABLED=true is left in the server .env.
 */
export function isSwaggerEnabled(swaggerEnabledFlag?: string): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return (swaggerEnabledFlag ?? 'true') === 'true';
}
